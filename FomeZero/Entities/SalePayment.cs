namespace FomeZero.Entities;

public class SalePayment : EntityBase
{
    public Guid SaleId { get; set; }
    public Sale? Sale { get; set; }
    public Guid PaymentMethodId { get; set; }
    public PaymentMethod? PaymentMethod { get; set; }
    public decimal Amount { get; set; }
}
