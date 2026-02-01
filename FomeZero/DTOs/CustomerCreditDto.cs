using FomeZero.Entities;

namespace FomeZero.DTOs;

public class CustomerCreditDto
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public decimal Amount { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime ReferenceDate { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AddCreditRequest
{
    public Guid CustomerId { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime? ReferenceDate { get; set; }
}

public class UseCreditRequest
{
    public Guid CustomerId { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime? ReferenceDate { get; set; }
}
