using FomeZero.Data;
using FomeZero.DTOs;
using FomeZero.Entities;
using FomeZero.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FomeZero.Repositories;

public class SaleRepository : ISaleRepository
{
    private readonly AppDbContext _context;

    public SaleRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Sale>> GetAllAsync()
    {
        return await _context.Sales
            .Include(s => s.Customer)
            .Include(s => s.Items)
                .ThenInclude(i => i.Snack)
            .ToListAsync();
    }

    public async Task<Sale?> GetByIdAsync(Guid id)
    {
        return await _context.Sales
            .Include(s => s.Customer)
            .Include(s => s.Items)
                .ThenInclude(i => i.Snack)
            .Include(s => s.Payments)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<IEnumerable<Sale>> GetByCustomerIdAsync(Guid customerId)
    {
        return await _context.Sales
            .Include(s => s.Items)
                .ThenInclude(i => i.Snack)
            .Where(s => s.CustomerId == customerId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Sale>> GetUnpaidAsync()
    {
        return await _context.Sales
            .Include(s => s.Customer)
            .Include(s => s.Items)
                .ThenInclude(i => i.Snack)
            .Include(s => s.Payments)
            .Where(s => !s.IsPaid)
            .ToListAsync();
    }

    public async Task<IEnumerable<Sale>> GetUnpaidByCustomerIdAsync(Guid customerId)
    {
        return await _context.Sales
            .Include(s => s.Items)
                .ThenInclude(i => i.Snack)
            .Include(s => s.Payments)
            .Where(s => s.CustomerId == customerId && !s.IsPaid)
            .OrderBy(s => s.SaleDate)
            .ToListAsync();
    }

    public async Task<Sale> CreateAsync(Sale sale, List<PaymentDetail>? payments = null)
    {
        _context.Sales.Add(sale);
        await _context.SaveChangesAsync();

        if (payments != null && payments.Count > 0 && sale.IsPaid)
        {
            foreach (var payment in payments)
            {
                var salePayment = new SalePayment
                {
                    SaleId = sale.Id,
                    PaymentMethodId = payment.PaymentMethodId,
                    Amount = payment.Amount
                };
                _context.SalePayments.Add(salePayment);
            }
            await _context.SaveChangesAsync();
        }

        return sale;
    }

    public async Task<Sale?> UpdateAsync(Sale sale)
    {
        _context.Sales.Update(sale);
        await _context.SaveChangesAsync();
        return sale;
    }

    public async Task<bool> MarkAsPaidAsync(Guid id, DateTime? paidAt, List<PaymentDetail>? payments)
    {
        var sale = await _context.Sales
            .Include(s => s.Items)
            .FirstOrDefaultAsync(s => s.Id == id);
        if (sale == null)
            return false;

        sale.IsPaid = true;
        sale.PaidAt = paidAt ?? DateTime.UtcNow;

        if (payments != null && payments.Count > 0)
        {
            foreach (var payment in payments)
            {
                var salePayment = new SalePayment
                {
                    SaleId = id,
                    PaymentMethodId = payment.PaymentMethodId,
                    Amount = payment.Amount
                };
                _context.SalePayments.Add(salePayment);
            }
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AddPaymentAsync(Guid saleId, DateTime? paidAt, List<PaymentDetail> payments, bool markAsPaid)
    {
        var sale = await _context.Sales
            .Include(s => s.Items)
            .Include(s => s.Payments)
            .FirstOrDefaultAsync(s => s.Id == saleId);
        if (sale == null)
            return false;

        foreach (var payment in payments)
        {
            var salePayment = new SalePayment
            {
                SaleId = saleId,
                PaymentMethodId = payment.PaymentMethodId,
                Amount = payment.Amount
            };
            _context.SalePayments.Add(salePayment);
        }

        if (markAsPaid)
        {
            sale.IsPaid = true;
            sale.PaidAt = paidAt ?? DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return true;
    }
}
