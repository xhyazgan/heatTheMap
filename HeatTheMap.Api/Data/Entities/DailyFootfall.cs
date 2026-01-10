namespace HeatTheMap.Api.Data.Entities;

public class DailyFootfall
{
    public int Id { get; set; }
    public int StoreId { get; set; }
    public DateOnly Date { get; set; }
    public int Hour { get; set; } // 0-23
    public int EntryCount { get; set; }
    public int ExitCount { get; set; }
    public int PeakOccupancy { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation property
    public Store Store { get; set; } = null!;
}
