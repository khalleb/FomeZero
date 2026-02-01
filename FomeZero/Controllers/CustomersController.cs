using FomeZero.DTOs;
using FomeZero.Entities;
using FomeZero.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FomeZero.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _service;

    public CustomersController(ICustomerService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<CustomerDto>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        var customers = await _service.GetAllAsync();

        // Apply search filter by name or WhatsApp
        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchDigits = new string(search.Where(char.IsDigit).ToArray());
            customers = customers.Where(c =>
                c.Name.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                (!string.IsNullOrEmpty(searchDigits) && !string.IsNullOrEmpty(c.WhatsApp) && c.WhatsApp.Contains(searchDigits)));
        }

        var customerList = customers.ToList();
        var totalCount = customerList.Count;

        var pagedItems = customerList
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var result = new PagedResult<CustomerDto>
        {
            Items = pagedItems,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CustomerDto>> GetById(Guid id)
    {
        var customer = await _service.GetByIdAsync(id);
        if (customer == null)
            return NotFound();

        return Ok(customer);
    }

    [HttpPost]
    public async Task<ActionResult<CustomerDto>> Create(Customer customer)
    {
        var (created, error) = await _service.CreateAsync(customer);
        if (error != null)
            return BadRequest(new { message = error });

        return CreatedAtAction(nameof(GetById), new { id = created!.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CustomerDto>> Update(Guid id, Customer customer)
    {
        var (updated, error) = await _service.UpdateAsync(id, customer);
        if (error != null)
        {
            if (error == "Cliente não encontrado.")
                return NotFound(new { message = error });
            return BadRequest(new { message = error });
        }

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
