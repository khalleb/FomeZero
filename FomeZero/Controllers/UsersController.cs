using FomeZero.DTOs;
using FomeZero.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FomeZero.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _service;

    public UsersController(IUserService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<UserResponse>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        var users = await _service.GetAllAsync();

        // Apply search filter
        if (!string.IsNullOrWhiteSpace(search))
        {
            users = users.Where(u =>
                u.Name.Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        var userList = users.ToList();
        var totalCount = userList.Count;

        var pagedItems = userList
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var result = new PagedResult<UserResponse>
        {
            Items = pagedItems,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserResponse>> GetById(Guid id)
    {
        var user = await _service.GetByIdAsync(id);
        if (user == null)
            return NotFound();

        return Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult<UserResponse>> Create(CreateUserRequest request)
    {
        var created = await _service.CreateAsync(request);
        if (created == null)
            return BadRequest(new { message = "Email já está em uso." });

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<UserResponse>> Update(Guid id, UpdateUserRequest request)
    {
        var updated = await _service.UpdateAsync(id, request);
        if (updated == null)
            return BadRequest(new { message = "Usuário não encontrado ou email já está em uso." });

        return Ok(updated);
    }
}
