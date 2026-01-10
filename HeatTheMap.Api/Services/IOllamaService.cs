using HeatTheMap.Api.DTOs;

namespace HeatTheMap.Api.Services;

public interface IOllamaService
{
    Task<ChatResponseDto> ProcessQueryAsync(string query, int storeId);
}
