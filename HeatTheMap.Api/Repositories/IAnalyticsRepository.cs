using HeatTheMap.Api.Data.Entities;

namespace HeatTheMap.Api.Repositories;

public interface IAnalyticsRepository
{
    Task<IEnumerable<DailyFootfall>> GetFootfallByDateRangeAsync(int storeId, DateOnly startDate, DateOnly endDate);
    Task<IEnumerable<DailyFootfall>> GetFootfallByDateAsync(int storeId, DateOnly date);
    Task<HeatmapData?> GetLatestHeatmapAsync(int storeId);
    Task<IEnumerable<HeatmapData>> GetHeatmapsByDateRangeAsync(int storeId, DateTime startTime, DateTime endTime);
    Task<IEnumerable<CustomerRoute>> GetRoutesByDateRangeAsync(int storeId, DateTime startTime, DateTime endTime);
    Task<int> GetTotalVisitorsAsync(int storeId, DateOnly date);
    Task<Dictionary<int, int>> GetHourlyDistributionAsync(int storeId, DateOnly date);
    Task<int> GetPeakHourAsync(int storeId, DateOnly date);
}
