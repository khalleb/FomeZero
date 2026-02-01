using FomeZero.DTOs;
using FomeZero.Entities;
using FomeZero.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FomeZero.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SalesController : ControllerBase
{
    private readonly ISaleService _service;

    public SalesController(ISaleService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<Sale>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        var sales = await _service.GetAllAsync();

        // Apply search filter by customer name
        if (!string.IsNullOrWhiteSpace(search))
        {
            sales = sales.Where(s =>
                s.Customer != null &&
                s.Customer.Name.Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        var salesList = sales.ToList();
        var totalCount = salesList.Count;

        var pagedItems = salesList
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var result = new PagedResult<Sale>
        {
            Items = pagedItems,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Sale>> GetById(Guid id)
    {
        var sale = await _service.GetByIdAsync(id);
        if (sale == null)
            return NotFound();

        return Ok(sale);
    }

    [HttpGet("customer/{customerId:guid}")]
    public async Task<ActionResult<PagedResult<Sale>>> GetByCustomerId(
        Guid customerId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var sales = await _service.GetByCustomerIdAsync(customerId);

        var salesList = sales.ToList();
        var totalCount = salesList.Count;

        var pagedItems = salesList
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var result = new PagedResult<Sale>
        {
            Items = pagedItems,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };

        return Ok(result);
    }

    [HttpGet("unpaid")]
    public async Task<ActionResult<PagedResult<Sale>>> GetUnpaid(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        var sales = await _service.GetUnpaidAsync();

        // Apply search filter by customer name
        if (!string.IsNullOrWhiteSpace(search))
        {
            sales = sales.Where(s =>
                s.Customer != null &&
                s.Customer.Name.Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        var salesList = sales.ToList();
        var totalCount = salesList.Count;

        var pagedItems = salesList
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var result = new PagedResult<Sale>
        {
            Items = pagedItems,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };

        return Ok(result);
    }

    [HttpGet("customer/{customerId:guid}/debt")]
    public async Task<ActionResult<decimal>> GetCustomerDebt(Guid customerId)
    {
        var totalDebt = await _service.GetTotalDebtByCustomerIdAsync(customerId);
        return Ok(new { customerId, totalDebt });
    }

    [HttpGet("customer/{customerId:guid}/unpaid")]
    public async Task<ActionResult<PagedResult<Sale>>> GetUnpaidByCustomerId(
        Guid customerId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var sales = await _service.GetUnpaidByCustomerIdAsync(customerId);

        var salesList = sales.ToList();
        var totalCount = salesList.Count;

        var pagedItems = salesList
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var result = new PagedResult<Sale>
        {
            Items = pagedItems,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };

        return Ok(result);
    }

    [HttpGet("debts")]
    public async Task<ActionResult<PagedResult<CustomerDebtDto>>> GetCustomersWithDebts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        var debts = await _service.GetCustomersWithDebtsAsync();

        // Apply search filter by customer name
        if (!string.IsNullOrWhiteSpace(search))
        {
            debts = debts.Where(d =>
                d.CustomerName.Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        var debtsList = debts.ToList();
        var totalCount = debtsList.Count;

        var pagedItems = debtsList
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var result = new PagedResult<CustomerDebtDto>
        {
            Items = pagedItems,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<Sale>> Create(SaleRequest request)
    {
        var sale = new Sale
        {
            CustomerId = request.CustomerId,
            SaleDate = request.SaleDate ?? DateTime.UtcNow,
            IsPaid = request.IsPaid,
            Items = request.Items.Select(i => new SaleItem
            {
                SnackId = i.SnackId,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                Discount = i.Discount,
                TotalAmount = i.TotalAmount
            }).ToList()
        };

        var created = await _service.CreateAsync(sale, request.Payments);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPatch("{id:guid}/pay")]
    public async Task<IActionResult> MarkAsPaid(Guid id, [FromBody] ReceivePaymentRequest? request)
    {
        var success = await _service.MarkAsPaidAsync(id, request?.PaidAt, request?.Payments);
        if (!success)
            return BadRequest(new { message = "Não foi possível processar o pagamento. Verifique se o valor total está correto." });

        return NoContent();
    }
}
