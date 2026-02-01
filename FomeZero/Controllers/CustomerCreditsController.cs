using FomeZero.DTOs;
using FomeZero.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FomeZero.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CustomerCreditsController : ControllerBase
{
    private readonly ICustomerCreditService _service;

    public CustomerCreditsController(ICustomerCreditService service)
    {
        _service = service;
    }

    [HttpGet("customer/{customerId:guid}")]
    public async Task<ActionResult<IEnumerable<CustomerCreditDto>>> GetByCustomerId(Guid customerId)
    {
        var credits = await _service.GetByCustomerIdAsync(customerId);
        return Ok(credits);
    }

    [HttpGet("customer/{customerId:guid}/balance")]
    public async Task<ActionResult<decimal>> GetBalance(Guid customerId)
    {
        var balance = await _service.GetBalanceAsync(customerId);
        return Ok(new { customerId, balance });
    }

    [HttpPost("add")]
    public async Task<ActionResult<CustomerCreditDto>> AddCredit(AddCreditRequest request)
    {
        var credit = await _service.AddCreditAsync(request);
        return Ok(credit);
    }

    [HttpPost("use")]
    public async Task<ActionResult<CustomerCreditDto>> UseCredit(UseCreditRequest request)
    {
        var (credit, error) = await _service.UseCreditAsync(request);
        if (error != null)
            return BadRequest(new { message = error });

        return Ok(credit);
    }
}
