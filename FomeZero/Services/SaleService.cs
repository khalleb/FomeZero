using FomeZero.DTOs;
using FomeZero.Entities;
using FomeZero.Interfaces;

namespace FomeZero.Services;

public class SaleService : ISaleService
{
    private readonly ISaleRepository _repository;
    private readonly ISnackRepository _snackRepository;

    public SaleService(ISaleRepository repository, ISnackRepository snackRepository)
    {
        _repository = repository;
        _snackRepository = snackRepository;
    }

    public async Task<IEnumerable<Sale>> GetAllAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<Sale?> GetByIdAsync(Guid id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<IEnumerable<Sale>> GetByCustomerIdAsync(Guid customerId)
    {
        return await _repository.GetByCustomerIdAsync(customerId);
    }

    public async Task<IEnumerable<Sale>> GetUnpaidAsync()
    {
        return await _repository.GetUnpaidAsync();
    }

    public async Task<IEnumerable<Sale>> GetUnpaidByCustomerIdAsync(Guid customerId)
    {
        return await _repository.GetUnpaidByCustomerIdAsync(customerId);
    }

    public async Task<decimal> GetTotalDebtByCustomerIdAsync(Guid customerId)
    {
        var unpaidSales = await _repository.GetUnpaidByCustomerIdAsync(customerId);
        return unpaidSales.Sum(s => s.TotalAmount);
    }

    public async Task<IEnumerable<CustomerDebtDto>> GetCustomersWithDebtsAsync()
    {
        var unpaidSales = await _repository.GetUnpaidAsync();

        var customerDebts = unpaidSales
            .GroupBy(s => s.CustomerId)
            .Select(g => new CustomerDebtDto
            {
                CustomerId = g.Key,
                CustomerName = g.First().Customer?.Name ?? "Cliente",
                CustomerWhatsApp = g.First().Customer?.WhatsApp ?? "",
                TotalDebt = g.Sum(s => s.TotalAmount),
                UnpaidSalesCount = g.Count(),
                OldestSaleDate = g.Min(s => s.SaleDate)
            })
            .OrderByDescending(c => c.TotalDebt)
            .ToList();

        return customerDebts;
    }

    public async Task<Sale> CreateAsync(Sale sale, List<PaymentDetail>? payments = null)
    {
        // Usa a data informada ou a data atual se não informada
        if (sale.SaleDate == default)
        {
            sale.SaleDate = DateTime.UtcNow;
        }

        if (sale.IsPaid)
        {
            sale.PaidAt = sale.SaleDate;
        }

        // O frontend DEVE enviar o UnitPrice correto (já com desconto aplicado se houver)
        // Não buscamos mais o preço do cadastro aqui

        return await _repository.CreateAsync(sale, payments);
    }

    public async Task<bool> MarkAsPaidAsync(Guid id, DateTime? paidAt, List<PaymentDetail>? payments)
    {
        if (payments != null && payments.Count > 0)
        {
            var sale = await _repository.GetByIdAsync(id);
            if (sale == null)
                return false;

            var paymentsTotal = payments.Sum(p => p.Amount);
            if (paymentsTotal != sale.TotalAmount)
                return false;
        }

        return await _repository.MarkAsPaidAsync(id, paidAt, payments);
    }
}
