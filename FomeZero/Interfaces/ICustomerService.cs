using FomeZero.DTOs;
using FomeZero.Entities;

namespace FomeZero.Interfaces;

public interface ICustomerService
{
    Task<IEnumerable<CustomerDto>> GetAllAsync();
    Task<CustomerDto?> GetByIdAsync(Guid id);
    Task<CustomerDto> CreateAsync(Customer customer);
    Task<CustomerDto?> UpdateAsync(Guid id, Customer customer);
    Task<bool> DeleteAsync(Guid id);
}
