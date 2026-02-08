using FomeZero.DTOs;
using FomeZero.Entities;

namespace FomeZero.Interfaces;

public interface ISaleService
{
    Task<IEnumerable<Sale>> GetAllAsync();
    Task<Sale?> GetByIdAsync(Guid id);
    Task<IEnumerable<Sale>> GetByCustomerIdAsync(Guid customerId);
    Task<IEnumerable<Sale>> GetUnpaidAsync();
    Task<IEnumerable<Sale>> GetUnpaidByCustomerIdAsync(Guid customerId);
    Task<decimal> GetTotalDebtByCustomerIdAsync(Guid customerId);
    Task<IEnumerable<CustomerDebtDto>> GetCustomersWithDebtsAsync();
    Task<Sale> CreateAsync(Sale sale, List<PaymentDetail>? payments = null);
    Task<bool> MarkAsPaidAsync(Guid id, DateTime? paidAt, List<PaymentDetail>? payments);
    Task<(bool Success, string? Error)> CancelAsync(Guid id);
}
