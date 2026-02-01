namespace FomeZero.DTOs;

public class ReceivePaymentRequest
{
    public DateTime? PaidAt { get; set; }
    public List<PaymentDetail> Payments { get; set; } = [];
}

public class PaymentDetail
{
    public Guid PaymentMethodId { get; set; }
    public decimal Amount { get; set; }
}
