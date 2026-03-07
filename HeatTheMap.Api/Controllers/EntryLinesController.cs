using HeatTheMap.Api.DTOs;
using HeatTheMap.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HeatTheMap.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EntryLinesController : ControllerBase
{
    private readonly IEntryLineService _entryLineService;
    private readonly ILogger<EntryLinesController> _logger;

    public EntryLinesController(IEntryLineService entryLineService, ILogger<EntryLinesController> logger)
    {
        _entryLineService = entryLineService;
        _logger = logger;
    }

    [HttpGet("store/{storeId}")]
    public async Task<ActionResult<EntryLineDto>> GetByStoreId(int storeId)
    {
        try
        {
            var entryLine = await _entryLineService.GetActiveEntryLineAsync(storeId);
            if (entryLine == null) return NotFound();
            return Ok(entryLine);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting entry line for store {StoreId}", storeId);
            return StatusCode(500, "An error occurred while retrieving entry line");
        }
    }

    [HttpPost]
    public async Task<ActionResult<EntryLineDto>> Create([FromBody] CreateEntryLineDto dto)
    {
        try
        {
            var entryLine = await _entryLineService.CreateEntryLineAsync(dto);
            return CreatedAtAction(nameof(GetByStoreId), new { storeId = entryLine.StoreId }, entryLine);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating entry line for store {StoreId}", dto.StoreId);
            return StatusCode(500, "An error occurred while creating entry line");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<EntryLineDto>> Update(int id, [FromBody] UpdateEntryLineDto dto)
    {
        try
        {
            var entryLine = await _entryLineService.UpdateEntryLineAsync(id, dto);
            if (entryLine == null) return NotFound();
            return Ok(entryLine);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating entry line {Id}", id);
            return StatusCode(500, "An error occurred while updating entry line");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        try
        {
            var result = await _entryLineService.DeleteEntryLineAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting entry line {Id}", id);
            return StatusCode(500, "An error occurred while deleting entry line");
        }
    }
}
