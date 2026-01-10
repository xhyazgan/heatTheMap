using System.Text.Json;
using HeatTheMap.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace HeatTheMap.Api.Data;

public class DataSeeder
{
    private readonly HeatMapDbContext _context;
    private readonly ILogger<DataSeeder> _logger;

    public DataSeeder(HeatMapDbContext context, ILogger<DataSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        try
        {
            // Ensure database is created
            await _context.Database.EnsureCreatedAsync();

            // Seed Stores
            if (!await _context.Stores.AnyAsync())
            {
                _logger.LogInformation("Seeding stores...");
                var stores = new List<Store>
                {
                    new Store
                    {
                        Name = "Downtown Flagship",
                        Location = "New York, NY",
                        Address = "123 Main St, New York, NY 10001",
                        Latitude = 40.7128,
                        Longitude = -74.0060,
                        FloorArea = 2500,
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true
                    },
                    new Store
                    {
                        Name = "Suburban Mall",
                        Location = "Los Angeles, CA",
                        Address = "456 Oak Ave, Los Angeles, CA 90001",
                        Latitude = 34.0522,
                        Longitude = -118.2437,
                        FloorArea = 1800,
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true
                    }
                };
                await _context.Stores.AddRangeAsync(stores);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Seeded {Count} stores", stores.Count);
            }

            // Seed DailyFootfall (last 30 days)
            if (!await _context.DailyFootfalls.AnyAsync())
            {
                _logger.LogInformation("Seeding daily footfall data...");
                var stores = await _context.Stores.ToListAsync();
                var footfalls = new List<DailyFootfall>();

                foreach (var store in stores)
                {
                    for (int day = 0; day < 30; day++)
                    {
                        var date = DateOnly.FromDateTime(DateTime.Today.AddDays(-day));
                        for (int hour = 9; hour < 21; hour++) // 9 AM to 9 PM
                        {
                            // Vary traffic based on hour (higher traffic midday and evening)
                            var baseTraffic = hour >= 12 && hour <= 14 ? 120 : (hour >= 17 && hour <= 19 ? 140 : 80);
                            var variance = Random.Shared.Next(-30, 30);

                            footfalls.Add(new DailyFootfall
                            {
                                StoreId = store.Id,
                                Date = date,
                                Hour = hour,
                                EntryCount = Math.Max(20, baseTraffic + variance),
                                ExitCount = Math.Max(20, baseTraffic + variance - 10),
                                PeakOccupancy = Random.Shared.Next(50, 200),
                                CreatedAt = DateTime.UtcNow
                            });
                        }
                    }
                }
                await _context.DailyFootfalls.AddRangeAsync(footfalls);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Seeded {Count} footfall records", footfalls.Count);
            }

            // Seed HeatmapData (hourly for last 7 days)
            if (!await _context.HeatmapData.AnyAsync())
            {
                _logger.LogInformation("Seeding heatmap data...");
                var stores = await _context.Stores.ToListAsync();
                var heatmaps = new List<HeatmapData>();

                foreach (var store in stores)
                {
                    for (int day = 0; day < 7; day++)
                    {
                        for (int hour = 9; hour < 21; hour++)
                        {
                            var timestamp = DateTime.UtcNow.AddDays(-day).Date.AddHours(hour);
                            var matrix = GenerateRandomHeatmap(20, 15);

                            heatmaps.Add(new HeatmapData
                            {
                                StoreId = store.Id,
                                Timestamp = timestamp,
                                ZoneMatrix = JsonSerializer.Serialize(matrix),
                                GridWidth = 20,
                                GridHeight = 15,
                                MaxDensity = matrix.SelectMany(row => row).Max()
                            });
                        }
                    }
                }
                await _context.HeatmapData.AddRangeAsync(heatmaps);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Seeded {Count} heatmap records", heatmaps.Count);
            }

            // Seed CustomerRoutes
            if (!await _context.CustomerRoutes.AnyAsync())
            {
                _logger.LogInformation("Seeding customer routes...");
                var stores = await _context.Stores.ToListAsync();
                var routes = new List<CustomerRoute>();

                foreach (var store in stores)
                {
                    for (int i = 0; i < 100; i++)
                    {
                        var waypoints = GenerateRandomRoute();
                        routes.Add(new CustomerRoute
                        {
                            StoreId = store.Id,
                            Timestamp = DateTime.UtcNow.AddDays(-Random.Shared.Next(0, 7)),
                            Waypoints = JsonSerializer.Serialize(waypoints),
                            DurationSeconds = Random.Shared.Next(120, 1800),
                            DistanceMeters = Random.Shared.Next(50, 500),
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }
                await _context.CustomerRoutes.AddRangeAsync(routes);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Seeded {Count} customer routes", routes.Count);
            }

            _logger.LogInformation("Data seeding completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding database");
            throw;
        }
    }

    private int[][] GenerateRandomHeatmap(int width, int height)
    {
        var matrix = new int[height][];
        for (int y = 0; y < height; y++)
        {
            matrix[y] = new int[width];
            for (int x = 0; x < width; x++)
            {
                // Create hotspots around entrance (bottom center) and center
                var distanceFromEntrance = Math.Sqrt(Math.Pow(x - width / 2, 2) + Math.Pow(y - height + 2, 2));
                var distanceFromCenter = Math.Sqrt(Math.Pow(x - width / 2, 2) + Math.Pow(y - height / 2, 2));
                var minDistance = Math.Min(distanceFromEntrance, distanceFromCenter);

                var baseValue = Math.Max(0, 100 - (int)(minDistance * 5));
                matrix[y][x] = Math.Max(0, baseValue + Random.Shared.Next(-20, 20));
            }
        }
        return matrix;
    }

    private List<object> GenerateRandomRoute()
    {
        var waypoints = new List<object>();
        var startTime = DateTime.UtcNow;
        var numWaypoints = Random.Shared.Next(5, 15);

        for (int i = 0; i < numWaypoints; i++)
        {
            waypoints.Add(new
            {
                x = Random.Shared.Next(0, 20),
                y = Random.Shared.Next(0, 15),
                timestamp = startTime.AddSeconds(i * 30).ToString("O")
            });
        }
        return waypoints;
    }
}
