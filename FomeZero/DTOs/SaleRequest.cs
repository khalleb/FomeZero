namespace FomeZero.DTOs;

public class SaleRequest
{
    public Guid CustomerId { get; set; }
    public DateTime? SaleDate { get; set; }
    public bool IsPaid { get; set; }
    public List<SaleItemRequest> Items { get; set; } = [];
    public List<PaymentDetail>? Payments { get; set; }
}

public class SaleItemRequest
{
    public Guid SnackId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Discount { get; set; }
    public decimal TotalAmount { get; set; }
}

public class MarkAsPaidRequest
{
    public DateTime? PaidAt { get; set; }
}
