using HeatTheMap.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace HeatTheMap.Api.Data;

public class HeatMapDbContext : DbContext
{
    public HeatMapDbContext(DbContextOptions<HeatMapDbContext> options) : base(options)
    {
    }

    public DbSet<Store> Stores { get; set; }
    public DbSet<DailyFootfall> DailyFootfalls { get; set; }
    public DbSet<HeatmapData> HeatmapData { get; set; }
    public DbSet<CustomerRoute> CustomerRoutes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Store configuration
        modelBuilder.Entity<Store>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.IsActive);

            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Location).HasMaxLength(200);
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
        });

        // DailyFootfall configuration
        modelBuilder.Entity<DailyFootfall>(entity =>
        {
            entity.HasKey(e => e.Id);

            // Unique index on StoreId, Date, Hour - prevent duplicate entries
            entity.HasIndex(e => new { e.StoreId, e.Date, e.Hour }).IsUnique();
            entity.HasIndex(e => e.Date);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Store)
                .WithMany(s => s.DailyFootfalls)
                .HasForeignKey(e => e.StoreId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // HeatmapData configuration
        modelBuilder.Entity<HeatmapData>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.HasIndex(e => new { e.StoreId, e.Timestamp });

            // Use PostgreSQL JSONB for zone matrix
            entity.Property(e => e.ZoneMatrix)
                .HasColumnType("jsonb")
                .IsRequired();

            entity.HasOne(e => e.Store)
                .WithMany(s => s.HeatmapData)
                .HasForeignKey(e => e.StoreId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // CustomerRoute configuration
        modelBuilder.Entity<CustomerRoute>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.HasIndex(e => new { e.StoreId, e.Timestamp });

            // Use PostgreSQL JSONB for waypoints
            entity.Property(e => e.Waypoints)
                .HasColumnType("jsonb")
                .IsRequired();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Store)
                .WithMany(s => s.CustomerRoutes)
                .HasForeignKey(e => e.StoreId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
