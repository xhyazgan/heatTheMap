using System.Text.Json;
using HeatTheMap.Api.DTOs;
using HeatTheMap.Api.Repositories;

namespace HeatTheMap.Api.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly IAnalyticsRepository _analyticsRepository;

    public AnalyticsService(IAnalyticsRepository analyticsRepository)
    {
        _analyticsRepository = analyticsRepository;
    }

    public async Task<DailySummaryDto> GetDailySummaryAsync(int storeId, DateOnly date)
    {
        var todayVisitors = await _analyticsRepository.GetTotalVisitorsAsync(storeId, date);
        var peakHour = await _analyticsRepository.GetPeakHourAsync(storeId, date);

        // Get routes for average stay duration
        var startTime = date.ToDateTime(TimeOnly.MinValue);
        var endTime = date.ToDateTime(TimeOnly.MaxValue);
        var routes = await _analyticsRepository.GetRoutesByDateRangeAsync(storeId, startTime, endTime);
        var avgStayDuration = routes.Any() ? routes.Average(r => r.DurationSeconds) : 0;

        // Calculate weekly change
        var lastWeekDate = date.AddDays(-7);
        var lastWeekVisitors = await _analyticsRepository.GetTotalVisitorsAsync(storeId, lastWeekDate);
        var weeklyChange = lastWeekVisitors > 0
            ? ((todayVisitors - lastWeekVisitors) / (double)lastWeekVisitors) * 100
            : 0;

        // Get current occupancy from latest heatmap
        var latestHeatmap = await _analyticsRepository.GetLatestHeatmapAsync(storeId);
        var currentOccupancy = 0;
        if (latestHeatmap != null)
        {
            try
            {
                var matrix = JsonSerializer.Deserialize<int[][]>(latestHeatmap.ZoneMatrix);
                currentOccupancy = matrix?.Sum(row => row.Sum()) ?? 0;
            }
            catch { }
        }

        return new DailySummaryDto(
            todayVisitors,
            avgStayDuration,
            peakHour,
            Math.Round(weeklyChange, 2),
            currentOccupancy
        );
    }

    public async Task<WeeklyTrendsDto> GetWeeklyTrendsAsync(int storeId, DateOnly startDate)
    {
        var endDate = startDate.AddDays(6);
        var footfalls = await _analyticsRepository.GetFootfallByDateRangeAsync(storeId, startDate, endDate);

        var dailyData = footfalls
            .GroupBy(f => f.Date)
            .Select(g => new DailyDataPoint(
                g.Key,
                g.Sum(f => f.EntryCount),
                g.Max(f => f.PeakOccupancy)
            ))
            .OrderBy(d => d.Date)
            .ToList();

        var totalVisitors = dailyData.Sum(d => d.TotalVisitors);

        // Calculate week-over-week change
        var previousWeekStart = startDate.AddDays(-7);
        var previousWeekEnd = previousWeekStart.AddDays(6);
        var previousWeekFootfalls = await _analyticsRepository.GetFootfallByDateRangeAsync(
            storeId, previousWeekStart, previousWeekEnd);
        var previousWeekTotal = previousWeekFootfalls.Sum(f => f.EntryCount);
        var weekOverWeekChange = previousWeekTotal > 0
            ? ((totalVisitors - previousWeekTotal) / (double)previousWeekTotal) * 100
            : 0;

        return new WeeklyTrendsDto(
            dailyData,
            Math.Round(weekOverWeekChange, 2),
            totalVisitors
        );
    }

    public async Task<HourlyDistributionDto> GetHourlyDistributionAsync(int storeId, DateOnly date)
    {
        var footfalls = await _analyticsRepository.GetFootfallByDateAsync(storeId, date);

        var hourlyEntries = footfalls.ToDictionary(f => f.Hour, f => f.EntryCount);
        var hourlyExits = footfalls.ToDictionary(f => f.Hour, f => f.ExitCount);

        var peakFootfall = footfalls.OrderByDescending(f => f.EntryCount).FirstOrDefault();
        var peakHour = peakFootfall?.Hour ?? 0;
        var peakCount = peakFootfall?.EntryCount ?? 0;

        return new HourlyDistributionDto(
            hourlyEntries,
            hourlyExits,
            peakHour,
            peakCount
        );
    }

    public async Task<ZonePerformanceDto> GetZonePerformanceAsync(int storeId, DateOnly startDate, DateOnly endDate)
    {
        var startTime = startDate.ToDateTime(TimeOnly.MinValue);
        var endTime = endDate.ToDateTime(TimeOnly.MaxValue);
        var heatmaps = await _analyticsRepository.GetHeatmapsByDateRangeAsync(storeId, startTime, endTime);

        var zoneVisits = new Dictionary<string, int>();

        foreach (var heatmap in heatmaps)
        {
            try
            {
                var matrix = JsonSerializer.Deserialize<int[][]>(heatmap.ZoneMatrix);
                if (matrix != null)
                {
                    for (int y = 0; y < matrix.Length; y++)
                    {
                        for (int x = 0; x < matrix[y].Length; x++)
                        {
                            var zoneName = $"Zone_{x}_{y}";
                            if (!zoneVisits.ContainsKey(zoneName))
                                zoneVisits[zoneName] = 0;
                            zoneVisits[zoneName] += matrix[y][x];
                        }
                    }
                }
            }
            catch { }
        }

        var totalVisits = zoneVisits.Values.Sum();
        var sortedZones = zoneVisits.OrderByDescending(z => z.Value).ToList();

        var hotZones = sortedZones.Take(5).Select(z => new HotZone(
            z.Key,
            z.Value,
            totalVisits > 0 ? Math.Round((z.Value / (double)totalVisits) * 100, 2) : 0
        )).ToList();

        var coldZones = sortedZones.TakeLast(5).Select(z => new ColdZone(
            z.Key,
            z.Value,
            totalVisits > 0 ? Math.Round((z.Value / (double)totalVisits) * 100, 2) : 0
        )).ToList();

        return new ZonePerformanceDto(zoneVisits, hotZones, coldZones);
    }

    public async Task<PeakHoursDto> GetPeakHoursAsync(int storeId, int days)
    {
        var endDate = DateOnly.FromDateTime(DateTime.Today);
        var startDate = endDate.AddDays(-days);
        var footfalls = await _analyticsRepository.GetFootfallByDateRangeAsync(storeId, startDate, endDate);

        var hourlyAverages = footfalls
            .GroupBy(f => f.Hour)
            .Select(g => new PeakHourData(
                g.Key,
                (int)g.Average(f => f.EntryCount),
                $"{g.Key:D2}:00 - {g.Key + 1:D2}:00"
            ))
            .OrderByDescending(h => h.VisitorCount)
            .Take(5)
            .ToList();

        var avgPeakDuration = "1-2 hours"; // Simplified - could be calculated from routes

        return new PeakHoursDto(hourlyAverages, avgPeakDuration);
    }
}
