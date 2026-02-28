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
        var credits = await _context.CustomerCredits
            .Where(c => c.CustomerId == customerId)
            .ToListAsync();

        return credits.Sum(c => c.Type == CreditType.Credit ? c.Amount : -c.Amount);
    }

    public async Task<Dictionary<Guid, decimal>> GetCreditBalancesAsync(List<Guid> customerIds)
    {
        if (customerIds.Count == 0)
            return new Dictionary<Guid, decimal>();

        var credits = await _context.CustomerCredits
            .Where(c => customerIds.Contains(c.CustomerId))
            .ToListAsync();

        var balances = credits
            .GroupBy(c => c.CustomerId)
            .ToDictionary(
                g => g.Key,
                g => g.Sum(c => c.Type == CreditType.Credit ? c.Amount : -c.Amount)
            );

        foreach (var id in customerIds.Where(id => !balances.ContainsKey(id)))
            balances[id] = 0;

        return balances;
    }
}
