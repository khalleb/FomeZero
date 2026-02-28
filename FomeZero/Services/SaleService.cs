using FomeZero.DTOs;
using FomeZero.Entities;
using FomeZero.Interfaces;

namespace FomeZero.Services;

public class SaleService : ISaleService
{
    private readonly ISaleRepository _repository;
    private readonly ISnackRepository _snackRepository;
    private readonly ICustomerCreditRepository _creditRepository;

    public SaleService(ISaleRepository repository, ISnackRepository snackRepository, ICustomerCreditRepository creditRepository)
    {
        _repository = repository;
        _snackRepository = snackRepository;
        _creditRepository = creditRepository;
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
        return unpaidSales.Sum(s => s.RemainingAmount);
    }

    public async Task<IEnumerable<CustomerDebtDto>> GetCustomersWithDebtsAsync()
    {
        var unpaidSales = await _repository.GetUnpaidAsync();

        var customerIds = unpaidSales.Select(s => s.CustomerId).Distinct().ToList();
        var creditBalances = await _creditRepository.GetCreditBalancesAsync(customerIds);

        var customerDebts = unpaidSales
            .GroupBy(s => s.CustomerId)
            .Select(g => new CustomerDebtDto
            {
                CustomerId = g.Key,
                CustomerName = g.First().Customer?.Name ?? "Cliente",
                CustomerWhatsApp = g.First().Customer?.WhatsApp ?? "",
                TotalDebt = g.Sum(s => s.RemainingAmount),
                CustomerCredit = creditBalances.GetValueOrDefault(g.Key, 0),
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
        if (payments == null || payments.Count == 0)
            return await _repository.MarkAsPaidAsync(id, paidAt, payments);

        var sale = await _repository.GetByIdAsync(id);
        if (sale == null)
            return false;

        var paymentsTotal = payments.Sum(p => p.Amount);
        var remaining = sale.RemainingAmount;

        if (paymentsTotal > remaining + 0.01m)
            return false;

        var isFullPayment = paymentsTotal >= remaining - 0.01m;
        return await _repository.AddPaymentAsync(id, paidAt, payments, isFullPayment);
    }

    public async Task<(bool Success, string? Error)> CancelAsync(Guid id)
    {
        var sale = await _repository.CancelAsync(id);
        if (sale == null) return (false, "Venda não encontrada");

        var paidAmount = sale.PaidAmount;
        if (paidAmount > 0)
        {
            await _creditRepository.CreateAsync(new CustomerCredit
            {
                CustomerId = sale.CustomerId,
                Amount = paidAmount,
                Type = CreditType.Credit,
                Description = "Estorno - Cancelamento de venda",
                ReferenceDate = DateTime.UtcNow
            });
            await _creditRepository.UpdateCustomerCreditAsync(sale.CustomerId, paidAmount);
        }

        return (true, null);
    }
}
