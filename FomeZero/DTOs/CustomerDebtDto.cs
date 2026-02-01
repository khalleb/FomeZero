namespace FomeZero.DTOs;

public class CustomerDebtDto
{
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerWhatsApp { get; set; } = string.Empty;
    public decimal TotalDebt { get; set; }
    public int UnpaidSalesCount { get; set; }
    public DateTime? OldestSaleDate { get; set; }
}
