namespace HeatTheMap.Api.Data.Entities;

public class CustomerRoute
{
    public int Id { get; set; }
    public int StoreId { get; set; }
    public DateTime Timestamp { get; set; }
    public string Waypoints { get; set; } = string.Empty; // JSON: {x,y,timestamp}[]
    public int DurationSeconds { get; set; }
    public double DistanceMeters { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation property
    public Store Store { get; set; } = null!;
}
