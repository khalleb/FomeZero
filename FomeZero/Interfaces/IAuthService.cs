using FomeZero.DTOs;

namespace FomeZero.Interfaces;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
}
