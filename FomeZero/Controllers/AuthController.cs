using FomeZero.DTOs;
using FomeZero.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FomeZero.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);

        if (response == null)
            return Unauthorized(new { message = "Email ou senha inválidos" });

        return Ok(response);
    }
}
