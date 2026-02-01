using FomeZero.Entities;

namespace FomeZero.Interfaces;

public interface ISnackService
{
    Task<IEnumerable<Snack>> GetAllAsync();
    Task<Snack?> GetByIdAsync(Guid id);
    Task<Snack> CreateAsync(Snack snack);
    Task<Snack?> UpdateAsync(Guid id, Snack snack);
    Task<bool> DeleteAsync(Guid id);
}
