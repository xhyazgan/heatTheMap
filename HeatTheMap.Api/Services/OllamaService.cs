using System.Text.Json;
using HeatTheMap.Api.DTOs;

namespace HeatTheMap.Api.Services;

public class OllamaService : IOllamaService
{
    private readonly HttpClient _httpClient;
    private readonly IAnalyticsService _analyticsService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<OllamaService> _logger;

    public OllamaService(
        HttpClient httpClient,
        IAnalyticsService analyticsService,
        IConfiguration configuration,
        ILogger<OllamaService> logger)
    {
        _httpClient = httpClient;
        _analyticsService = analyticsService;
        _configuration = configuration;
        _logger = logger;

        var baseUrl = configuration["Ollama:BaseUrl"] ?? "http://localhost:11434";
        _httpClient.BaseAddress = new Uri(baseUrl);
    }

    public async Task<ChatResponseDto> ProcessQueryAsync(string query, int storeId)
    {
        try
        {
            // Check if Ollama is available
            var isAvailable = await CheckOllamaAvailability();
            if (!isAvailable)
            {
                _logger.LogWarning("Ollama is not available, using fallback response");
                return await GenerateFallbackResponse(query, storeId);
            }

            // Step 1: Send query to Ollama with function definitions
            var ollamaRequest = new OllamaRequest(
                Model: "llama3.1",
                Messages: new List<OllamaMessage>
                {
                    new OllamaMessage("system", GetSystemPrompt()),
                    new OllamaMessage("user", query)
                },
                Tools: GetFunctionDefinitions(),
                Stream: false
            );

            var response = await _httpClient.PostAsJsonAsync("/api/chat", ollamaRequest);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Ollama API returned error: {StatusCode}", response.StatusCode);
                return await GenerateFallbackResponse(query, storeId);
            }

            var ollamaResponse = await response.Content.ReadFromJsonAsync<OllamaResponse>();

            if (ollamaResponse?.Message == null)
            {
                return await GenerateFallbackResponse(query, storeId);
            }

            // Step 2: Check if Ollama wants to call a function
            if (ollamaResponse.Message.ToolCalls?.Any() == true)
            {
                var toolCall = ollamaResponse.Message.ToolCalls.First();
                var functionResult = await ExecuteFunctionAsync(toolCall.Function, storeId);

                // Step 3: Send function result back to Ollama for natural language generation
                var followUpRequest = new OllamaRequest(
                    Model: "llama3.1",
                    Messages: new List<OllamaMessage>
                    {
                        new OllamaMessage("system", GetSystemPrompt()),
                        new OllamaMessage("user", query),
                        new OllamaMessage("assistant", "", ollamaResponse.Message.ToolCalls),
                        new OllamaMessage("tool", functionResult)
                    },
                    Stream: false
                );

                var followUpResponse = await _httpClient.PostAsJsonAsync("/api/chat", followUpRequest);
                var finalResponse = await followUpResponse.Content.ReadFromJsonAsync<OllamaResponse>();

                return new ChatResponseDto(finalResponse?.Message.Content ?? "I couldn't generate a response.");
            }

            // No function call needed, return direct response
            return new ChatResponseDto(ollamaResponse.Message.Content);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Ollama query");
            return await GenerateFallbackResponse(query, storeId);
        }
    }

    private async Task<bool> CheckOllamaAvailability()
    {
        try
        {
            var response = await _httpClient.GetAsync("/api/tags");
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    private async Task<ChatResponseDto> GenerateFallbackResponse(string query, int storeId)
    {
        // Simple keyword-based fallback when Ollama is unavailable
        var today = DateOnly.FromDateTime(DateTime.Today);

        try
        {
            if (query.Contains("today", StringComparison.OrdinalIgnoreCase) ||
                query.Contains("bugün", StringComparison.OrdinalIgnoreCase))
            {
                var summary = await _analyticsService.GetDailySummaryAsync(storeId, today);
                return new ChatResponseDto(
                    $"Today's summary: {summary.TodayVisitors} visitors, peak hour at {summary.PeakHour}:00, " +
                    $"average stay {summary.AverageStayDuration:F0} seconds. Weekly change: {summary.WeeklyChangePercent:+0.0;-0.0}%");
            }

            if (query.Contains("week", StringComparison.OrdinalIgnoreCase) ||
                query.Contains("hafta", StringComparison.OrdinalIgnoreCase))
            {
                var startDate = today.AddDays(-6);
                var trends = await _analyticsService.GetWeeklyTrendsAsync(storeId, startDate);
                return new ChatResponseDto(
                    $"Weekly trends: {trends.TotalVisitors} total visitors, " +
                    $"week-over-week change: {trends.WeekOverWeekChange:+0.0;-0.0}%");
            }

            if (query.Contains("busiest", StringComparison.OrdinalIgnoreCase) ||
                query.Contains("peak", StringComparison.OrdinalIgnoreCase) ||
                query.Contains("yoğun", StringComparison.OrdinalIgnoreCase))
            {
                var peakHours = await _analyticsService.GetPeakHoursAsync(storeId, 7);
                var top3 = string.Join(", ", peakHours.PeakHours.Take(3).Select(h => $"{h.Hour}:00"));
                return new ChatResponseDto($"Busiest hours in the last week: {top3}");
            }

            return new ChatResponseDto(
                "I can help you analyze store data. Try asking about today's performance, weekly trends, or busiest hours. " +
                "(Note: Ollama is not running, so I'm using simplified responses)");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating fallback response");
            return new ChatResponseDto("I'm having trouble accessing the analytics data right now.");
        }
    }

    private List<OllamaTool> GetFunctionDefinitions()
    {
        return new List<OllamaTool>
        {
            new OllamaTool(
                Type: "function",
                Function: new OllamaFunctionDefinition(
                    Name: "get_daily_summary",
                    Description: "Get today's visitor summary, peak hours, average stay duration, and weekly trends for a store",
                    Parameters: new
                    {
                        type = "object",
                        properties = new
                        {
                            date = new { type = "string", description = "Date in YYYY-MM-DD format" }
                        },
                        required = new[] { "date" }
                    }
                )
            ),
            new OllamaTool(
                Type: "function",
                Function: new OllamaFunctionDefinition(
                    Name: "get_weekly_comparison",
                    Description: "Compare current week performance to previous week for a store",
                    Parameters: new
                    {
                        type = "object",
                        properties = new
                        {
                            startDate = new { type = "string", description = "Start date in YYYY-MM-DD format" }
                        },
                        required = new[] { "startDate" }
                    }
                )
            ),
            new OllamaTool(
                Type: "function",
                Function: new OllamaFunctionDefinition(
                    Name: "get_busiest_hours",
                    Description: "Get the busiest hours over the last N days for a store",
                    Parameters: new
                    {
                        type = "object",
                        properties = new
                        {
                            days = new { type = "integer", description = "Number of days to analyze (default 7)" }
                        },
                        required = new[] { "days" }
                    }
                )
            ),
            new OllamaTool(
                Type: "function",
                Function: new OllamaFunctionDefinition(
                    Name: "get_zone_performance",
                    Description: "Get hot zones and cold zones with visitor counts for a date range",
                    Parameters: new
                    {
                        type = "object",
                        properties = new
                        {
                            startDate = new { type = "string", description = "Start date in YYYY-MM-DD format" },
                            endDate = new { type = "string", description = "End date in YYYY-MM-DD format" }
                        },
                        required = new[] { "startDate", "endDate" }
                    }
                )
            )
        };
    }

    private async Task<string> ExecuteFunctionAsync(OllamaFunction function, int storeId)
    {
        try
        {
            var args = JsonSerializer.Deserialize<JsonElement>(function.Arguments);

            switch (function.Name)
            {
                case "get_daily_summary":
                    var date = args.GetProperty("date").GetString();
                    var summary = await _analyticsService.GetDailySummaryAsync(storeId, DateOnly.Parse(date ?? DateTime.Today.ToString("yyyy-MM-dd")));
                    return JsonSerializer.Serialize(new
                    {
                        todayVisitors = summary.TodayVisitors,
                        averageStayDuration = $"{summary.AverageStayDuration:F0} seconds",
                        peakHour = $"{summary.PeakHour}:00",
                        weeklyChange = $"{summary.WeeklyChangePercent:+0.0;-0.0}%",
                        currentOccupancy = summary.CurrentOccupancy
                    });

                case "get_weekly_comparison":
                    var startDateStr = args.GetProperty("startDate").GetString();
                    var trends = await _analyticsService.GetWeeklyTrendsAsync(storeId, DateOnly.Parse(startDateStr ?? DateTime.Today.AddDays(-6).ToString("yyyy-MM-dd")));
                    return JsonSerializer.Serialize(new
                    {
                        totalVisitors = trends.TotalVisitors,
                        weekOverWeekChange = $"{trends.WeekOverWeekChange:+0.0;-0.0}%",
                        dailyBreakdown = trends.DailyData.Select(d => new { date = d.Date.ToString(), visitors = d.TotalVisitors })
                    });

                case "get_busiest_hours":
                    var days = args.TryGetProperty("days", out var daysElement) ? daysElement.GetInt32() : 7;
                    var peakHours = await _analyticsService.GetPeakHoursAsync(storeId, days);
                    return JsonSerializer.Serialize(new
                    {
                        peakHours = peakHours.PeakHours.Select(h => new { hour = h.Hour, timeRange = h.TimeRange, visitorCount = h.VisitorCount }),
                        averagePeakDuration = peakHours.AveragePeakDuration
                    });

                case "get_zone_performance":
                    var zoneStartDate = args.GetProperty("startDate").GetString();
                    var zoneEndDate = args.GetProperty("endDate").GetString();
                    var performance = await _analyticsService.GetZonePerformanceAsync(
                        storeId,
                        DateOnly.Parse(zoneStartDate ?? DateTime.Today.AddDays(-7).ToString("yyyy-MM-dd")),
                        DateOnly.Parse(zoneEndDate ?? DateTime.Today.ToString("yyyy-MM-dd"))
                    );
                    return JsonSerializer.Serialize(new
                    {
                        hotZones = performance.HotZones.Select(z => new { zone = z.ZoneName, visits = z.VisitCount, percentage = $"{z.Percentage}%" }),
                        coldZones = performance.ColdZones.Select(z => new { zone = z.ZoneName, visits = z.VisitCount, percentage = $"{z.Percentage}%" })
                    });

                default:
                    return JsonSerializer.Serialize(new { error = "Unknown function" });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing function {FunctionName}", function.Name);
            return JsonSerializer.Serialize(new { error = ex.Message });
        }
    }

    private string GetSystemPrompt()
    {
        return @"You are a helpful retail analytics assistant for HeatTheMap.
You help store managers understand their foot traffic data, visitor patterns, and store performance.
When users ask questions about store analytics, use the available functions to retrieve accurate data.
Provide concise, conversational responses with specific numbers and insights.
If asked in Turkish, respond in Turkish. If asked in English, respond in English.
Keep answers brief but informative - aim for 2-3 sentences maximum.";
    }
}
