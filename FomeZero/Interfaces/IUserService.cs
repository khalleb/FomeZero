using FomeZero.DTOs;

namespace FomeZero.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserResponse>> GetAllAsync();
    Task<UserResponse?> GetByIdAsync(Guid id);
    Task<UserResponse?> CreateAsync(CreateUserRequest request);
    Task<UserResponse?> UpdateAsync(Guid id, UpdateUserRequest request);
}
