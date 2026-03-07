namespace HeatTheMap.Api.Data.Entities;

public class EntryLine
{
    public int Id { get; set; }
    public int StoreId { get; set; }
    public double StartX { get; set; }
    public double StartY { get; set; }
    public double EndX { get; set; }
    public double EndY { get; set; }
    public string InDirection { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation property
    public Store Store { get; set; } = null!;
}
