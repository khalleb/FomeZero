using FomeZero.Data;
using FomeZero.Entities;
using FomeZero.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FomeZero.Repositories;

public class CustomerCreditRepository : ICustomerCreditRepository
{
    private readonly AppDbContext _context;

    public CustomerCreditRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CustomerCredit>> GetByCustomerIdAsync(Guid customerId)
    {
        return await _context.CustomerCredits
            .Where(c => c.CustomerId == customerId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<CustomerCredit> CreateAsync(CustomerCredit credit)
    {
        _context.CustomerCredits.Add(credit);
        await _context.SaveChangesAsync();
        return credit;
    }

    public async Task UpdateCustomerCreditAsync(Guid customerId, decimal amount)
    {
        var customer = await _context.Customers.FindAsync(customerId);
        if (customer != null)
        {
            customer.Credit += amount;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<decimal> GetCustomerCreditBalanceAsync(Guid customerId)
    {
        var customer = await _context.Customers.FindAsync(customerId);
        return customer?.Credit ?? 0;
    }
}
