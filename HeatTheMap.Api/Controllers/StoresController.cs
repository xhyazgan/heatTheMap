using HeatTheMap.Api.Data.Entities;
using HeatTheMap.Api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HeatTheMap.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StoresController : ControllerBase
{
    private readonly IRepository<Store> _storeRepository;
    private readonly ILogger<StoresController> _logger;

    public StoresController(IRepository<Store> storeRepository, ILogger<StoresController> logger)
    {
        _storeRepository = storeRepository;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Store>>> GetAll()
    {
        try
        {
            var stores = await _storeRepository.GetAllAsync();
            return Ok(stores);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving stores");
            return StatusCode(500, "An error occurred while retrieving stores");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Store>> GetById(int id)
    {
        try
        {
            var store = await _storeRepository.GetByIdAsync(id);
            if (store == null)
                return NotFound();
            return Ok(store);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving store {StoreId}", id);
            return StatusCode(500, "An error occurred while retrieving the store");
        }
    }

    [HttpPost]
    public async Task<ActionResult<Store>> Create([FromBody] Store store)
    {
        try
        {
            store.CreatedAt = DateTime.UtcNow;
            var created = await _storeRepository.AddAsync(store);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating store");
            return StatusCode(500, "An error occurred while creating the store");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Store>> Update(int id, [FromBody] Store store)
    {
        try
        {
            if (id != store.Id)
                return BadRequest("Store ID mismatch");

            var exists = await _storeRepository.ExistsAsync(id);
            if (!exists)
                return NotFound();

            var updated = await _storeRepository.UpdateAsync(store);
            return Ok(updated);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating store {StoreId}", id);
            return StatusCode(500, "An error occurred while updating the store");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        try
        {
            var deleted = await _storeRepository.DeleteAsync(id);
            if (!deleted)
                return NotFound();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting store {StoreId}", id);
            return StatusCode(500, "An error occurred while deleting the store");
        }
    }
}
