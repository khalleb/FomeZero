using FomeZero.Entities;

namespace FomeZero.Interfaces;

public interface IPaymentMethodService
{
    Task<IEnumerable<PaymentMethod>> GetAllAsync();
    Task<PaymentMethod?> GetByIdAsync(Guid id);
    Task<PaymentMethod> CreateAsync(PaymentMethod paymentMethod);
    Task<PaymentMethod?> UpdateAsync(Guid id, PaymentMethod paymentMethod);
}
