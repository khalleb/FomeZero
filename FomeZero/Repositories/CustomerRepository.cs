using FomeZero.Data;
using FomeZero.Entities;
using FomeZero.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FomeZero.Repositories;

public class CustomerRepository : ICustomerRepository
{
    private readonly AppDbContext _context;

    public CustomerRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Customer>> GetAllAsync()
    {
        return await _context.Customers.ToListAsync();
    }

    public async Task<Customer?> GetByIdAsync(Guid id)
    {
        return await _context.Customers.FindAsync(id);
    }

    public async Task<Customer?> GetByNameAsync(string name, Guid? excludeId = null)
    {
        var query = _context.Customers
            .Where(c => c.Name.ToLower() == name.ToLower());

        if (excludeId.HasValue)
            query = query.Where(c => c.Id != excludeId.Value);

        return await query.FirstOrDefaultAsync();
    }

    public async Task<Customer?> GetByWhatsAppAsync(string whatsApp, Guid? excludeId = null)
    {
        if (string.IsNullOrWhiteSpace(whatsApp))
            return null;

        var query = _context.Customers
            .Where(c => c.WhatsApp == whatsApp);

        if (excludeId.HasValue)
            query = query.Where(c => c.Id != excludeId.Value);

        return await query.FirstOrDefaultAsync();
    }

    public async Task<Customer> CreateAsync(Customer customer)
    {
        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();
        return customer;
    }

    public async Task<Customer?> UpdateAsync(Customer customer)
    {
        _context.Customers.Update(customer);
        await _context.SaveChangesAsync();
        return customer;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var customer = await _context.Customers.FindAsync(id);
        if (customer == null)
            return false;

        _context.Customers.Remove(customer);
        await _context.SaveChangesAsync();
        return true;
    }
}
