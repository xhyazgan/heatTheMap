using HeatTheMap.Api.Data.Entities;
using HeatTheMap.Api.DTOs;
using HeatTheMap.Api.Repositories;

namespace HeatTheMap.Api.Services;

public class EntryLineService : IEntryLineService
{
    private readonly IRepository<EntryLine> _repository;

    public EntryLineService(IRepository<EntryLine> repository)
    {
        _repository = repository;
    }

    public async Task<EntryLineDto?> GetActiveEntryLineAsync(int storeId)
    {
        var results = await _repository.FindAsync(e => e.StoreId == storeId && e.IsActive);
        var entryLine = results.FirstOrDefault();
        return entryLine == null ? null : MapToDto(entryLine);
    }

    public async Task<EntryLineDto> CreateEntryLineAsync(CreateEntryLineDto dto)
    {
        // Deactivate existing active entry lines for this store
        var existing = await _repository.FindAsync(e => e.StoreId == dto.StoreId && e.IsActive);
        foreach (var line in existing)
        {
            line.IsActive = false;
            line.UpdatedAt = DateTime.UtcNow;
            await _repository.UpdateAsync(line);
        }

        var entryLine = new EntryLine
        {
            StoreId = dto.StoreId,
            StartX = dto.StartX,
            StartY = dto.StartY,
            EndX = dto.EndX,
            EndY = dto.EndY,
            InDirection = dto.InDirection,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(entryLine);
        return MapToDto(created);
    }

    public async Task<EntryLineDto?> UpdateEntryLineAsync(int id, UpdateEntryLineDto dto)
    {
        var entryLine = await _repository.GetByIdAsync(id);
        if (entryLine == null) return null;

        entryLine.StartX = dto.StartX;
        entryLine.StartY = dto.StartY;
        entryLine.EndX = dto.EndX;
        entryLine.EndY = dto.EndY;
        entryLine.InDirection = dto.InDirection;
        entryLine.IsActive = dto.IsActive;
        entryLine.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateAsync(entryLine);
        return MapToDto(updated);
    }

    public async Task<bool> DeleteEntryLineAsync(int id)
    {
        var entryLine = await _repository.GetByIdAsync(id);
        if (entryLine == null) return false;

        entryLine.IsActive = false;
        entryLine.UpdatedAt = DateTime.UtcNow;
        await _repository.UpdateAsync(entryLine);
        return true;
    }

    private static EntryLineDto MapToDto(EntryLine entity)
    {
        return new EntryLineDto(
            entity.Id,
            entity.StoreId,
            entity.StartX,
            entity.StartY,
            entity.EndX,
            entity.EndY,
            entity.InDirection,
            entity.IsActive,
            entity.CreatedAt
        );
    }
}
