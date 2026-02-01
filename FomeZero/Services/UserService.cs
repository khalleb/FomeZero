using FomeZero.DTOs;
using FomeZero.Entities;
using FomeZero.Interfaces;

namespace FomeZero.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _repository;

    public UserService(IUserRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<UserResponse>> GetAllAsync()
    {
        var users = await _repository.GetAllAsync();
        return users.Select(MapToResponse);
    }

    public async Task<UserResponse?> GetByIdAsync(Guid id)
    {
        var user = await _repository.GetByIdAsync(id);
        return user == null ? null : MapToResponse(user);
    }

    public async Task<UserResponse?> CreateAsync(CreateUserRequest request)
    {
        var existingUser = await _repository.GetByEmailAsync(request.Email);
        if (existingUser != null)
            return null;

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Active = true
        };

        var created = await _repository.CreateAsync(user);
        return MapToResponse(created);
    }

    public async Task<UserResponse?> UpdateAsync(Guid id, UpdateUserRequest request)
    {
        var existingUser = await _repository.GetByIdAsync(id);
        if (existingUser == null)
            return null;

        var userWithEmail = await _repository.GetByEmailAsync(request.Email);
        if (userWithEmail != null && userWithEmail.Id != id)
            return null;

        existingUser.Name = request.Name;
        existingUser.Email = request.Email;
        existingUser.Active = request.Active;

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            existingUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        }

        var updated = await _repository.UpdateAsync(existingUser);
        return updated == null ? null : MapToResponse(updated);
    }

    private static UserResponse MapToResponse(User user)
    {
        return new UserResponse
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Active = user.Active,
            CreatedAt = user.CreatedAt
        };
    }
}
