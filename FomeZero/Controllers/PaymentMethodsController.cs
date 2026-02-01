using FomeZero.DTOs;
using FomeZero.Entities;
using FomeZero.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FomeZero.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PaymentMethodsController : ControllerBase
{
    private readonly IPaymentMethodService _service;

    public PaymentMethodsController(IPaymentMethodService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<PaymentMethod>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        var paymentMethods = await _service.GetAllAsync();

        // Apply search filter
        if (!string.IsNullOrWhiteSpace(search))
        {
            paymentMethods = paymentMethods.Where(p =>
                p.Name.Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        var paymentMethodList = paymentMethods.ToList();
        var totalCount = paymentMethodList.Count;

        var pagedItems = paymentMethodList
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var result = new PagedResult<PaymentMethod>
        {
            Items = pagedItems,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PaymentMethod>> GetById(Guid id)
    {
        var paymentMethod = await _service.GetByIdAsync(id);
        if (paymentMethod == null)
            return NotFound();

        return Ok(paymentMethod);
    }

    [HttpPost]
    public async Task<ActionResult<PaymentMethod>> Create(PaymentMethod paymentMethod)
    {
        var created = await _service.CreateAsync(paymentMethod);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<PaymentMethod>> Update(Guid id, PaymentMethod paymentMethod)
    {
        var updated = await _service.UpdateAsync(id, paymentMethod);
        if (updated == null)
            return NotFound();

        return Ok(updated);
    }
}
