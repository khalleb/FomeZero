namespace FomeZero.Entities;

public enum CreditType
{
    Credit = 1,  // Entrada de crédito
    Debit = 2    // Uso do crédito
}

public class CustomerCredit : EntityBase
{
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public decimal Amount { get; set; }
    public CreditType Type { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime ReferenceDate { get; set; }
}
