using FomeZero.Data;
using FomeZero.Entities;
using FomeZero.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FomeZero.Repositories;

public class SnackRepository : ISnackRepository
{
    private readonly AppDbContext _context;

    public SnackRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Snack>> GetAllAsync()
    {
        return await _context.Snacks.ToListAsync();
    }

    public async Task<Snack?> GetByIdAsync(Guid id)
    {
        return await _context.Snacks.FindAsync(id);
    }

    public async Task<Snack> CreateAsync(Snack snack)
    {
        _context.Snacks.Add(snack);
        await _context.SaveChangesAsync();
        return snack;
    }

    public async Task<Snack?> UpdateAsync(Snack snack)
    {
        _context.Snacks.Update(snack);
        await _context.SaveChangesAsync();
        return snack;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var snack = await _context.Snacks.FindAsync(id);
        if (snack == null)
            return false;

        _context.Snacks.Remove(snack);
        await _context.SaveChangesAsync();
        return true;
    }
}
