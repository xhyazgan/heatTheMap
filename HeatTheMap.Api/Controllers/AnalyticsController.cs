using HeatTheMap.Api.DTOs;
using HeatTheMap.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HeatTheMap.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;
    private readonly ILogger<AnalyticsController> _logger;

    public AnalyticsController(IAnalyticsService analyticsService, ILogger<AnalyticsController> logger)
    {
        _analyticsService = analyticsService;
        _logger = logger;
    }

    /// <summary>
    /// Get daily summary including today's visitors, average stay duration, peak hour, and weekly change
    /// </summary>
    [HttpGet("daily-summary")]
    public async Task<ActionResult<DailySummaryDto>> GetDailySummary(
        [FromQuery] int storeId,
        [FromQuery] string date)
    {
        try
        {
            var parsedDate = DateOnly.Parse(date);
            var summary = await _analyticsService.GetDailySummaryAsync(storeId, parsedDate);
            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting daily summary for store {StoreId} on {Date}", storeId, date);
            return StatusCode(500, "An error occurred while retrieving daily summary");
        }
    }

    /// <summary>
    /// Get weekly trends with 7-day data and week-over-week comparison
    /// </summary>
    [HttpGet("weekly-trends")]
    public async Task<ActionResult<WeeklyTrendsDto>> GetWeeklyTrends(
        [FromQuery] int storeId,
        [FromQuery] string startDate)
    {
        try
        {
            var parsedDate = DateOnly.Parse(startDate);
            var trends = await _analyticsService.GetWeeklyTrendsAsync(storeId, parsedDate);
            return Ok(trends);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting weekly trends for store {StoreId}", storeId);
            return StatusCode(500, "An error occurred while retrieving weekly trends");
        }
    }

    /// <summary>
    /// Get hourly distribution of entries and exits for a specific date
    /// </summary>
    [HttpGet("hourly-distribution")]
    public async Task<ActionResult<HourlyDistributionDto>> GetHourlyDistribution(
        [FromQuery] int storeId,
        [FromQuery] string date)
    {
        try
        {
            var parsedDate = DateOnly.Parse(date);
            var distribution = await _analyticsService.GetHourlyDistributionAsync(storeId, parsedDate);
            return Ok(distribution);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting hourly distribution for store {StoreId}", storeId);
            return StatusCode(500, "An error occurred while retrieving hourly distribution");
        }
    }

    /// <summary>
    /// Get zone performance with hot zones and cold zones
    /// </summary>
    [HttpGet("zone-performance")]
    public async Task<ActionResult<ZonePerformanceDto>> GetZonePerformance(
        [FromQuery] int storeId,
        [FromQuery] string startDate,
        [FromQuery] string endDate)
    {
        try
        {
            var parsedStartDate = DateOnly.Parse(startDate);
            var parsedEndDate = DateOnly.Parse(endDate);
            var performance = await _analyticsService.GetZonePerformanceAsync(storeId, parsedStartDate, parsedEndDate);
            return Ok(performance);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting zone performance for store {StoreId}", storeId);
            return StatusCode(500, "An error occurred while retrieving zone performance");
        }
    }

    /// <summary>
    /// Get peak hours over the last N days
    /// </summary>
    [HttpGet("peak-hours")]
    public async Task<ActionResult<PeakHoursDto>> GetPeakHours(
        [FromQuery] int storeId,
        [FromQuery] int days = 7)
    {
        try
        {
            var peakHours = await _analyticsService.GetPeakHoursAsync(storeId, days);
            return Ok(peakHours);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting peak hours for store {StoreId}", storeId);
            return StatusCode(500, "An error occurred while retrieving peak hours");
        }
    }
}
