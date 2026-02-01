namespace FomeZero.Entities;

public class SaleItem : EntityBase
{
    public Guid SaleId { get; set; }
    public Sale? Sale { get; set; }
    public Guid SnackId { get; set; }
    public Snack? Snack { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Discount { get; set; }
    public decimal TotalAmount { get; set; }

    // Valor calculado sem desconto (para referência)
    public decimal SubTotal => Quantity * UnitPrice;
}
