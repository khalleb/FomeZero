namespace FomeZero.DTOs;

public class DashboardStatsRequest
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class DashboardStatsResponse
{
    // Contadores gerais
    public int TotalCustomers { get; set; }
    public int TotalSnacks { get; set; }
    public int TotalSalesInPeriod { get; set; }

    // Financeiro - período selecionado
    public decimal TotalCollectedInPeriod { get; set; }
    public decimal AverageTicketInPeriod { get; set; }

    // Total a receber (não depende do período - sempre todas as vendas fiadas)
    public decimal TotalReceivable { get; set; }
    public int UnpaidSalesCount { get; set; }

    // Comparativo mensal
    public decimal CurrentMonthTotal { get; set; }
    public decimal PreviousMonthTotal { get; set; }
    public decimal MonthOverMonthGrowth { get; set; }

    // Lanches mais vendidos no período
    public List<SnackRankingItem> TopSellingSnacks { get; set; } = [];

    // Clientes
    public List<CustomerDebtRanking> TopDebtors { get; set; } = [];
    public CustomerBuyerRanking? TopBuyerByQuantity { get; set; }
    public CustomerBuyerRanking? TopBuyerByValue { get; set; }

    // Alertas
    public List<OldDebtAlert> OldDebts { get; set; } = [];
    public List<HighRiskCustomerAlert> HighRiskCustomers { get; set; } = [];

    // Histórico mensal (últimos 6 meses)
    public List<MonthlyData> MonthlyHistory { get; set; } = [];
}

public class SnackRankingItem
{
    public string SnackName { get; set; } = string.Empty;
    public int QuantitySold { get; set; }
    public decimal TotalRevenue { get; set; }
}

public class CustomerDebtRanking
{
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public decimal TotalDebt { get; set; }
    public int UnpaidSalesCount { get; set; }
}

public class CustomerBuyerRanking
{
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public int PurchaseCount { get; set; }
    public decimal TotalSpent { get; set; }
}

public class OldDebtAlert
{
    public Guid SaleId { get; set; }
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public DateTime SaleDate { get; set; }
    public int DaysOverdue { get; set; }
    public decimal Amount { get; set; }
}

public class HighRiskCustomerAlert
{
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public decimal TotalDebt { get; set; }
    public int UnpaidSalesCount { get; set; }
    public string RiskReason { get; set; } = string.Empty;
}

public class MonthlyData
{
    public string Month { get; set; } = string.Empty;
    public decimal Total { get; set; }
}
