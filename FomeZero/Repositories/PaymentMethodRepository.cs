using FomeZero.Data;
using FomeZero.Entities;
using FomeZero.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FomeZero.Repositories;

public class PaymentMethodRepository : IPaymentMethodRepository
{
    private readonly AppDbContext _context;

    public PaymentMethodRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PaymentMethod>> GetAllAsync()
    {
        return await _context.PaymentMethods.ToListAsync();
    }

    public async Task<PaymentMethod?> GetByIdAsync(Guid id)
    {
        return await _context.PaymentMethods.FindAsync(id);
    }

    public async Task<PaymentMethod> CreateAsync(PaymentMethod paymentMethod)
    {
        _context.PaymentMethods.Add(paymentMethod);
        await _context.SaveChangesAsync();
        return paymentMethod;
    }

    public async Task<PaymentMethod?> UpdateAsync(PaymentMethod paymentMethod)
    {
        _context.PaymentMethods.Update(paymentMethod);
        await _context.SaveChangesAsync();
        return paymentMethod;
    }
}
