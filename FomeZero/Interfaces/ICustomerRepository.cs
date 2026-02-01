using FomeZero.Entities;

namespace FomeZero.Interfaces;

public interface ICustomerRepository
{
    Task<IEnumerable<Customer>> GetAllAsync();
    Task<Customer?> GetByIdAsync(Guid id);
    Task<Customer> CreateAsync(Customer customer);
    Task<Customer?> UpdateAsync(Customer customer);
    Task<bool> DeleteAsync(Guid id);
}
