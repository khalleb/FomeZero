using FomeZero.Entities;
using FomeZero.Interfaces;

namespace FomeZero.Services;

public class PaymentMethodService : IPaymentMethodService
{
    private readonly IPaymentMethodRepository _repository;

    public PaymentMethodService(IPaymentMethodRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<PaymentMethod>> GetAllAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<PaymentMethod?> GetByIdAsync(Guid id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<PaymentMethod> CreateAsync(PaymentMethod paymentMethod)
    {
        return await _repository.CreateAsync(paymentMethod);
    }

    public async Task<PaymentMethod?> UpdateAsync(Guid id, PaymentMethod paymentMethod)
    {
        var existingPaymentMethod = await _repository.GetByIdAsync(id);
        if (existingPaymentMethod == null)
            return null;

        existingPaymentMethod.Name = paymentMethod.Name;
        existingPaymentMethod.Active = paymentMethod.Active;

        return await _repository.UpdateAsync(existingPaymentMethod);
    }
}
