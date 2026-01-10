namespace HeatTheMap.Api.Data.Entities;

public class Store
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int FloorArea { get; set; } // square meters
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }

    // Navigation properties
    public ICollection<DailyFootfall> DailyFootfalls { get; set; } = new List<DailyFootfall>();
    public ICollection<HeatmapData> HeatmapData { get; set; } = new List<HeatmapData>();
    public ICollection<CustomerRoute> CustomerRoutes { get; set; } = new List<CustomerRoute>();
}
