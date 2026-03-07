using HeatTheMap.Api.DTOs;

namespace HeatTheMap.Api.Services;

public interface IEntryLineService
{
    Task<EntryLineDto?> GetActiveEntryLineAsync(int storeId);
    Task<EntryLineDto> CreateEntryLineAsync(CreateEntryLineDto dto);
    Task<EntryLineDto?> UpdateEntryLineAsync(int id, UpdateEntryLineDto dto);
    Task<bool> DeleteEntryLineAsync(int id);
}
