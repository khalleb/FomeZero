using FomeZero.Entities;
using FomeZero.Interfaces;

namespace FomeZero.Services;

public class SnackService : ISnackService
{
    private readonly ISnackRepository _repository;

    public SnackService(ISnackRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Snack>> GetAllAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<Snack?> GetByIdAsync(Guid id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<Snack> CreateAsync(Snack snack)
    {
        return await _repository.CreateAsync(snack);
    }

    public async Task<Snack?> UpdateAsync(Guid id, Snack snack)
    {
        var existingSnack = await _repository.GetByIdAsync(id);
        if (existingSnack == null)
            return null;

        existingSnack.Name = snack.Name;
        existingSnack.Description = snack.Description;
        existingSnack.Price = snack.Price;
        existingSnack.Active = snack.Active;

        return await _repository.UpdateAsync(existingSnack);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        return await _repository.DeleteAsync(id);
    }
}
