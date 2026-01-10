namespace HeatTheMap.Api.Data.Entities;

public class HeatmapData
{
    public int Id { get; set; }
    public int StoreId { get; set; }
    public DateTime Timestamp { get; set; }
    public string ZoneMatrix { get; set; } = string.Empty; // JSON: int[][]
    public int GridWidth { get; set; }
    public int GridHeight { get; set; }
    public int MaxDensity { get; set; }

    // Navigation property
    public Store Store { get; set; } = null!;
}
