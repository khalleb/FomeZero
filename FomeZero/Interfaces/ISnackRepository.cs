using FomeZero.Entities;

namespace FomeZero.Interfaces;

public interface ISnackRepository
{
    Task<IEnumerable<Snack>> GetAllAsync();
    Task<Snack?> GetByIdAsync(Guid id);
    Task<Snack> CreateAsync(Snack snack);
    Task<Snack?> UpdateAsync(Snack snack);
    Task<bool> DeleteAsync(Guid id);
}
