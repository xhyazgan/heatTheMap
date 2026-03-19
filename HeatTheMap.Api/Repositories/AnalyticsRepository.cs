using HeatTheMap.Api.Data;
using HeatTheMap.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace HeatTheMap.Api.Repositories;

public class AnalyticsRepository : IAnalyticsRepository
{
    private readonly HeatMapDbContext _context;

    public AnalyticsRepository(HeatMapDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<DailyFootfall>> GetFootfallByDateRangeAsync(int storeId, DateOnly startDate, DateOnly endDate)
    {
        return await _context.DailyFootfalls
            .Where(f => f.StoreId == storeId && f.Date >= startDate && f.Date <= endDate)
            .OrderBy(f => f.Date)
            .ThenBy(f => f.Hour)
            .ToListAsync();
    }

    public async Task<IEnumerable<DailyFootfall>> GetFootfallByDateAsync(int storeId, DateOnly date)
    {
        return await _context.DailyFootfalls
            .Where(f => f.StoreId == storeId && f.Date == date)
            .OrderBy(f => f.Hour)
            .ToListAsync();
    }

    public async Task<HeatmapData?> GetLatestHeatmapAsync(int storeId)
    {
        return await _context.HeatmapData
            .Where(h => h.StoreId == storeId)
            .OrderByDescending(h => h.Timestamp)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<HeatmapData>> GetHeatmapsByDateRangeAsync(int storeId, DateTime startTime, DateTime endTime)
    {
        return await _context.HeatmapData
            .Where(h => h.StoreId == storeId && h.Timestamp >= startTime && h.Timestamp <= endTime)
            .OrderBy(h => h.Timestamp)
            .ToListAsync();
    }

    public async Task<IEnumerable<CustomerRoute>> GetRoutesByDateRangeAsync(int storeId, DateTime startTime, DateTime endTime)
    {
        return await _context.CustomerRoutes
            .Where(r => r.StoreId == storeId && r.Timestamp >= startTime && r.Timestamp <= endTime)
            .OrderBy(r => r.Timestamp)
            .ToListAsync();
    }

    public async Task<int> GetTotalVisitorsAsync(int storeId, DateOnly date)
    {
        return await _context.DailyFootfalls
            .Where(f => f.StoreId == storeId && f.Date == date)
            .SumAsync(f => f.EntryCount);
    }

    public async Task<Dictionary<int, int>> GetHourlyDistributionAsync(int storeId, DateOnly date)
    {
        var footfalls = await GetFootfallByDateAsync(storeId, date);
        return footfalls.ToDictionary(f => f.Hour, f => f.EntryCount);
    }

    public async Task<int> GetPeakHourAsync(int storeId, DateOnly date)
    {
        var footfalls = await GetFootfallByDateAsync(storeId, date);
        var peakFootfall = footfalls.OrderByDescending(f => f.EntryCount).FirstOrDefault();
        return peakFootfall?.Hour ?? 0;
    }

    public async Task<HeatmapData> AddHeatmapDataAsync(HeatmapData data)
    {
        _context.HeatmapData.Add(data);
        await _context.SaveChangesAsync();
        return data;
    }

    public async Task UpsertFootfallAsync(DailyFootfall footfall)
    {
        var existing = await _context.DailyFootfalls
            .FirstOrDefaultAsync(f =>
                f.StoreId == footfall.StoreId &&
                f.Date == footfall.Date &&
                f.Hour == footfall.Hour);

        if (existing != null)
        {
            existing.EntryCount += footfall.EntryCount;
            existing.ExitCount += footfall.ExitCount;
            existing.PeakOccupancy = Math.Max(existing.PeakOccupancy, footfall.PeakOccupancy);
        }
        else
        {
            _context.DailyFootfalls.Add(footfall);
        }

        await _context.SaveChangesAsync();
    }

    public async Task<(int footfallCount, int heatmapCount, int routeCount)> ResetStoreDataAsync(int storeId)
    {
        var footfallCount = await _context.DailyFootfalls
            .Where(f => f.StoreId == storeId)
            .ExecuteDeleteAsync();

        var heatmapCount = await _context.HeatmapData
            .Where(h => h.StoreId == storeId)
            .ExecuteDeleteAsync();

        var routeCount = await _context.CustomerRoutes
            .Where(r => r.StoreId == storeId)
            .ExecuteDeleteAsync();

        return (footfallCount, heatmapCount, routeCount);
    }
}
