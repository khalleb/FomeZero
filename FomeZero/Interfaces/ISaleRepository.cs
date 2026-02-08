using FomeZero.DTOs;
using FomeZero.Entities;

namespace FomeZero.Interfaces;

public interface ISaleRepository
{
    Task<IEnumerable<Sale>> GetAllAsync();
    Task<Sale?> GetByIdAsync(Guid id);
    Task<IEnumerable<Sale>> GetByCustomerIdAsync(Guid customerId);
    Task<IEnumerable<Sale>> GetUnpaidAsync();
    Task<IEnumerable<Sale>> GetUnpaidByCustomerIdAsync(Guid customerId);
    Task<Sale> CreateAsync(Sale sale, List<PaymentDetail>? payments = null);
    Task<Sale?> UpdateAsync(Sale sale);
    Task<bool> MarkAsPaidAsync(Guid id, DateTime? paidAt, List<PaymentDetail>? payments);
    Task<bool> AddPaymentAsync(Guid saleId, DateTime? paidAt, List<PaymentDetail> payments, bool markAsPaid);
}
