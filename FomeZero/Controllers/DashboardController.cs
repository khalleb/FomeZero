using FomeZero.DTOs;
using FomeZero.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FomeZero.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _service;

    public DashboardController(IDashboardService service)
    {
        _service = service;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsResponse>> GetStats(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var stats = await _service.GetStatsAsync(startDate, endDate);
        return Ok(stats);
    }
}
