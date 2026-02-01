using FomeZero.DTOs;
using FomeZero.Entities;
using FomeZero.Interfaces;

namespace FomeZero.Services;

public class CustomerCreditService : ICustomerCreditService
{
    private readonly ICustomerCreditRepository _repository;

    public CustomerCreditService(ICustomerCreditRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<CustomerCreditDto>> GetByCustomerIdAsync(Guid customerId)
    {
        var credits = await _repository.GetByCustomerIdAsync(customerId);
        return credits.Select(MapToDto);
    }

    public async Task<decimal> GetBalanceAsync(Guid customerId)
    {
        return await _repository.GetCustomerCreditBalanceAsync(customerId);
    }

    public async Task<CustomerCreditDto> AddCreditAsync(AddCreditRequest request)
    {
        var credit = new CustomerCredit
        {
            CustomerId = request.CustomerId,
            Amount = request.Amount,
            Type = CreditType.Credit,
            Description = request.Description,
            ReferenceDate = request.ReferenceDate ?? DateTime.UtcNow
        };

        var created = await _repository.CreateAsync(credit);
        await _repository.UpdateCustomerCreditAsync(request.CustomerId, request.Amount);

        return MapToDto(created);
    }

    public async Task<(CustomerCreditDto? Credit, string? Error)> UseCreditAsync(UseCreditRequest request)
    {
        var balance = await _repository.GetCustomerCreditBalanceAsync(request.CustomerId);

        if (balance < request.Amount)
            return (null, $"Saldo insuficiente. Saldo disponível: R$ {balance:N2}");

        var credit = new CustomerCredit
        {
            CustomerId = request.CustomerId,
            Amount = request.Amount,
            Type = CreditType.Debit,
            Description = request.Description,
            ReferenceDate = request.ReferenceDate ?? DateTime.UtcNow
        };

        var created = await _repository.CreateAsync(credit);
        await _repository.UpdateCustomerCreditAsync(request.CustomerId, -request.Amount);

        return (MapToDto(created), null);
    }

    private static CustomerCreditDto MapToDto(CustomerCredit credit)
    {
        return new CustomerCreditDto
        {
            Id = credit.Id,
            CustomerId = credit.CustomerId,
            Amount = credit.Amount,
            Type = credit.Type == CreditType.Credit ? "Crédito" : "Débito",
            Description = credit.Description,
            ReferenceDate = credit.ReferenceDate,
            CreatedAt = credit.CreatedAt
        };
    }
}
