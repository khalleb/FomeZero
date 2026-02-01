using FomeZero.DTOs;
using FomeZero.Entities;

namespace FomeZero.Interfaces;

public interface ICustomerService
{
    Task<IEnumerable<CustomerDto>> GetAllAsync();
    Task<CustomerDto?> GetByIdAsync(Guid id);
    Task<(CustomerDto? Customer, string? Error)> CreateAsync(Customer customer);
    Task<(CustomerDto? Customer, string? Error)> UpdateAsync(Guid id, Customer customer);
    Task<bool> DeleteAsync(Guid id);
}
