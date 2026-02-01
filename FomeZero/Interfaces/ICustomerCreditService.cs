using FomeZero.DTOs;

namespace FomeZero.Interfaces;

public interface ICustomerCreditService
{
    Task<IEnumerable<CustomerCreditDto>> GetByCustomerIdAsync(Guid customerId);
    Task<decimal> GetBalanceAsync(Guid customerId);
    Task<CustomerCreditDto> AddCreditAsync(AddCreditRequest request);
    Task<(CustomerCreditDto? Credit, string? Error)> UseCreditAsync(UseCreditRequest request);
}
