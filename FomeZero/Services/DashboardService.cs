using FomeZero.Data;
using FomeZero.DTOs;
using FomeZero.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FomeZero.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;

    public DashboardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsResponse> GetStatsAsync(DateTime? startDate, DateTime? endDate)
    {
        var response = new DashboardStatsResponse();

        // Contadores gerais
        response.TotalCustomers = await _context.Customers.CountAsync(c => c.Active);
        response.TotalSnacks = await _context.Snacks.CountAsync(s => s.Active);

        // Todas as vendas com itens e clientes para calcular totais
        var allSales = await _context.Sales
            .Include(s => s.Items)
                .ThenInclude(i => i.Snack)
            .Include(s => s.Customer)
            .ToListAsync();

        // Total a receber (todas as vendas fiadas - não depende do período)
        var unpaidSales = allSales.Where(s => !s.IsPaid).ToList();
        response.TotalReceivable = unpaidSales.Sum(s => s.TotalAmount);
        response.UnpaidSalesCount = unpaidSales.Count;

        // Vendas no período selecionado
        var salesInPeriod = allSales.AsEnumerable();

        if (startDate.HasValue)
        {
            var start = startDate.Value.Date;
            salesInPeriod = salesInPeriod.Where(s => s.SaleDate.Date >= start);
        }

        if (endDate.HasValue)
        {
            var end = endDate.Value.Date.AddDays(1).AddTicks(-1);
            salesInPeriod = salesInPeriod.Where(s => s.SaleDate.Date <= endDate.Value.Date);
        }

        var salesInPeriodList = salesInPeriod.ToList();
        response.TotalSalesInPeriod = salesInPeriodList.Count;

        // Total arrecadado no período (vendas pagas no período)
        var paidSalesInPeriod = salesInPeriodList.Where(s => s.IsPaid).ToList();
        response.TotalCollectedInPeriod = paidSalesInPeriod.Sum(s => s.TotalAmount);

        // Ticket médio no período (todas as vendas do período)
        response.AverageTicketInPeriod = salesInPeriodList.Count > 0
            ? salesInPeriodList.Average(s => s.TotalAmount)
            : 0;

        // Comparativo mensal
        var now = DateTime.UtcNow;
        var currentMonthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var previousMonthStart = currentMonthStart.AddMonths(-1);
        var previousMonthEnd = currentMonthStart.AddTicks(-1);

        var currentMonthSales = allSales
            .Where(s => s.SaleDate >= currentMonthStart)
            .ToList();
        response.CurrentMonthTotal = currentMonthSales.Sum(s => s.TotalAmount);

        var previousMonthSales = allSales
            .Where(s => s.SaleDate >= previousMonthStart && s.SaleDate <= previousMonthEnd)
            .ToList();
        response.PreviousMonthTotal = previousMonthSales.Sum(s => s.TotalAmount);

        // Crescimento percentual
        if (response.PreviousMonthTotal > 0)
        {
            response.MonthOverMonthGrowth = ((response.CurrentMonthTotal - response.PreviousMonthTotal) / response.PreviousMonthTotal) * 100;
        }
        else if (response.CurrentMonthTotal > 0)
        {
            response.MonthOverMonthGrowth = 100;
        }
        else
        {
            response.MonthOverMonthGrowth = 0;
        }

        // Histórico mensal (últimos 6 meses)
        var monthlyHistory = new List<MonthlyData>();
        for (int i = 5; i >= 0; i--)
        {
            var monthStart = currentMonthStart.AddMonths(-i);
            var monthEnd = monthStart.AddMonths(1).AddTicks(-1);
            var monthName = monthStart.ToString("MMM/yy", new System.Globalization.CultureInfo("pt-BR"));

            var monthTotal = allSales
                .Where(s => s.SaleDate >= monthStart && s.SaleDate <= monthEnd)
                .Sum(s => s.TotalAmount);

            monthlyHistory.Add(new MonthlyData
            {
                Month = monthName,
                Total = monthTotal
            });
        }
        response.MonthlyHistory = monthlyHistory;

        // Top 3 lanches mais vendidos no período
        response.TopSellingSnacks = salesInPeriodList
            .SelectMany(s => s.Items)
            .GroupBy(i => new { i.SnackId, SnackName = i.Snack?.Name ?? "Desconhecido" })
            .Select(g => new SnackRankingItem
            {
                SnackName = g.Key.SnackName,
                QuantitySold = g.Sum(i => i.Quantity),
                TotalRevenue = g.Sum(i => i.Quantity * i.UnitPrice)
            })
            .OrderByDescending(s => s.QuantitySold)
            .Take(3)
            .ToList();

        // Top 5 maiores devedores (não depende do período)
        response.TopDebtors = unpaidSales
            .GroupBy(s => new { s.CustomerId, CustomerName = s.Customer?.Name ?? "Desconhecido" })
            .Select(g => new CustomerDebtRanking
            {
                CustomerId = g.Key.CustomerId,
                CustomerName = g.Key.CustomerName,
                TotalDebt = g.Sum(s => s.TotalAmount),
                UnpaidSalesCount = g.Count()
            })
            .OrderByDescending(c => c.TotalDebt)
            .Take(5)
            .ToList();

        // Cliente que mais compra por quantidade no período
        var topBuyerByQuantity = salesInPeriodList
            .GroupBy(s => new { s.CustomerId, CustomerName = s.Customer?.Name ?? "Desconhecido" })
            .Select(g => new CustomerBuyerRanking
            {
                CustomerId = g.Key.CustomerId,
                CustomerName = g.Key.CustomerName,
                PurchaseCount = g.Count(),
                TotalSpent = g.Sum(s => s.TotalAmount)
            })
            .OrderByDescending(c => c.PurchaseCount)
            .FirstOrDefault();

        response.TopBuyerByQuantity = topBuyerByQuantity;

        // Cliente que mais compra por valor no período
        var topBuyerByValue = salesInPeriodList
            .GroupBy(s => new { s.CustomerId, CustomerName = s.Customer?.Name ?? "Desconhecido" })
            .Select(g => new CustomerBuyerRanking
            {
                CustomerId = g.Key.CustomerId,
                CustomerName = g.Key.CustomerName,
                PurchaseCount = g.Count(),
                TotalSpent = g.Sum(s => s.TotalAmount)
            })
            .OrderByDescending(c => c.TotalSpent)
            .FirstOrDefault();

        response.TopBuyerByValue = topBuyerByValue;

        // Alertas: Débitos antigos (vendas fiadas há mais de 30 dias)
        var thirtyDaysAgo = now.AddDays(-30);
        response.OldDebts = unpaidSales
            .Where(s => s.SaleDate < thirtyDaysAgo)
            .OrderBy(s => s.SaleDate)
            .Take(10)
            .Select(s => new OldDebtAlert
            {
                SaleId = s.Id,
                CustomerId = s.CustomerId,
                CustomerName = s.Customer?.Name ?? "Desconhecido",
                SaleDate = s.SaleDate,
                DaysOverdue = (int)(now - s.SaleDate).TotalDays,
                Amount = s.TotalAmount
            })
            .ToList();

        // Alertas: Clientes de alto risco (muitas vendas fiadas ou valor alto)
        const int highRiskUnpaidCount = 3;
        const decimal highRiskDebtAmount = 100m;

        response.HighRiskCustomers = unpaidSales
            .GroupBy(s => new { s.CustomerId, CustomerName = s.Customer?.Name ?? "Desconhecido" })
            .Select(g => new
            {
                CustomerId = g.Key.CustomerId,
                CustomerName = g.Key.CustomerName,
                TotalDebt = g.Sum(s => s.TotalAmount),
                UnpaidSalesCount = g.Count()
            })
            .Where(c => c.UnpaidSalesCount >= highRiskUnpaidCount || c.TotalDebt >= highRiskDebtAmount)
            .OrderByDescending(c => c.TotalDebt)
            .Take(5)
            .Select(c => new HighRiskCustomerAlert
            {
                CustomerId = c.CustomerId,
                CustomerName = c.CustomerName,
                TotalDebt = c.TotalDebt,
                UnpaidSalesCount = c.UnpaidSalesCount,
                RiskReason = c.UnpaidSalesCount >= highRiskUnpaidCount && c.TotalDebt >= highRiskDebtAmount
                    ? $"Muitas compras fiadas ({c.UnpaidSalesCount}) e valor alto (R$ {c.TotalDebt:N2})"
                    : c.UnpaidSalesCount >= highRiskUnpaidCount
                        ? $"Muitas compras fiadas ({c.UnpaidSalesCount})"
                        : $"Valor alto em aberto (R$ {c.TotalDebt:N2})"
            })
            .ToList();

        return response;
    }
}
