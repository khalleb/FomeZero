using FomeZero.DTOs;
using FomeZero.Entities;
using FomeZero.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FomeZero.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SnacksController : ControllerBase
{
    private readonly ISnackService _service;

    public SnacksController(ISnackService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<Snack>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        var snacks = await _service.GetAllAsync();

        // Apply search filter
        if (!string.IsNullOrWhiteSpace(search))
        {
            snacks = snacks.Where(s =>
                s.Name.Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        var snackList = snacks.ToList();
        var totalCount = snackList.Count;

        var pagedItems = snackList
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var result = new PagedResult<Snack>
        {
            Items = pagedItems,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Snack>> GetById(Guid id)
    {
        var snack = await _service.GetByIdAsync(id);
        if (snack == null)
            return NotFound();

        return Ok(snack);
    }

    [HttpPost]
    public async Task<ActionResult<Snack>> Create(Snack snack)
    {
        var created = await _service.CreateAsync(snack);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<Snack>> Update(Guid id, Snack snack)
    {
        var updated = await _service.UpdateAsync(id, snack);
        if (updated == null)
            return NotFound();

        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted)
            return NotFound();

        return NoContent();
    }
}
