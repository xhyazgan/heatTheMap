using HeatTheMap.Api.DTOs;

namespace HeatTheMap.Api.Services;

public interface IAnalyticsService
{
    Task<DailySummaryDto> GetDailySummaryAsync(int storeId, DateOnly date);
    Task<WeeklyTrendsDto> GetWeeklyTrendsAsync(int storeId, DateOnly startDate);
    Task<HourlyDistributionDto> GetHourlyDistributionAsync(int storeId, DateOnly date);
    Task<ZonePerformanceDto> GetZonePerformanceAsync(int storeId, DateOnly startDate, DateOnly endDate);
    Task<PeakHoursDto> GetPeakHoursAsync(int storeId, int days);
    Task<HeatmapDataDto?> GetLatestHeatmapDataAsync(int storeId);
    Task SubmitDetectionAsync(DetectionSubmissionDto dto);
    Task<(int footfallCount, int heatmapCount, int routeCount)> ResetStoreDataAsync(int storeId);
}
