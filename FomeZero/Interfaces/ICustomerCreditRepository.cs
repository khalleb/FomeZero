using FomeZero.Entities;

namespace FomeZero.Interfaces;

public interface ICustomerCreditRepository
{
    Task<IEnumerable<CustomerCredit>> GetByCustomerIdAsync(Guid customerId);
    Task<CustomerCredit> CreateAsync(CustomerCredit credit);
    Task UpdateCustomerCreditAsync(Guid customerId, decimal amount);
    Task<decimal> GetCustomerCreditBalanceAsync(Guid customerId);
}
