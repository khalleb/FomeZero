namespace FomeZero.Entities;

public class Sale : EntityBase
{
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public DateTime SaleDate { get; set; }
    public bool IsPaid { get; set; }
    public DateTime? PaidAt { get; set; }
    public List<SaleItem> Items { get; set; } = [];
    public List<SalePayment> Payments { get; set; } = [];

    public decimal TotalAmount => Items.Sum(i => i.TotalAmount);
}
