using HeatTheMap.Api.DTOs;
using HeatTheMap.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HeatTheMap.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly IOllamaService _ollamaService;
    private readonly ILogger<ChatController> _logger;

    public ChatController(IOllamaService ollamaService, ILogger<ChatController> logger)
    {
        _ollamaService = ollamaService;
        _logger = logger;
    }

    /// <summary>
    /// Process a natural language query about store analytics
    /// </summary>
    /// <param name="request">Chat request with query and store ID</param>
    /// <returns>Natural language response with analytics data</returns>
    [HttpPost]
    public async Task<ActionResult<ChatResponseDto>> Chat([FromBody] ChatRequestDto request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Query))
            {
                return BadRequest(new { message = "Query cannot be empty" });
            }

            if (request.StoreId <= 0)
            {
                return BadRequest(new { message = "Invalid store ID" });
            }

            _logger.LogInformation("Processing chat query for store {StoreId}: {Query}",
                request.StoreId, request.Query);

            var response = await _ollamaService.ProcessQueryAsync(request.Query, request.StoreId);

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing chat request for store {StoreId}", request.StoreId);
            return StatusCode(500, new ChatResponseDto(
                "I'm having trouble processing your question right now. Please try again later."));
        }
    }
}
