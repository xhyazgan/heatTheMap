namespace HeatTheMap.Api.DTOs;

public record DailySummaryDto(
    int TodayVisitors,
    double AverageStayDuration,
    int PeakHour,
    double WeeklyChangePercent,
    int CurrentOccupancy
);

public record DailyDataPoint(
    DateOnly Date,
    int TotalVisitors,
    int PeakOccupancy
);

public record WeeklyTrendsDto(
    List<DailyDataPoint> DailyData,
    double WeekOverWeekChange,
    int TotalVisitors
);

public record HourlyDistributionDto(
    Dictionary<int, int> HourlyEntries,
    Dictionary<int, int> HourlyExits,
    int PeakHour,
    int PeakCount
);

public record HotZone(
    string ZoneName,
    int VisitCount,
    double Percentage
);

public record ColdZone(
    string ZoneName,
    int VisitCount,
    double Percentage
);

public record ZonePerformanceDto(
    Dictionary<string, int> ZoneVisits,
    List<HotZone> HotZones,
    List<ColdZone> ColdZones
);

public record PeakHourData(
    int Hour,
    int VisitorCount,
    string TimeRange
);

public record PeakHoursDto(
    List<PeakHourData> PeakHours,
    string AveragePeakDuration
);

public record DetectionSubmissionDto(
    int StoreId,
    DateTime Timestamp,
    int PersonCount,
    int ExitCount,
    int[][]? ZoneDistribution
);

public record HeatmapDataDto(
    int[][] ZoneMatrix,
    int GridWidth,
    int GridHeight,
    int MaxDensity,
    DateTime Timestamp
);
