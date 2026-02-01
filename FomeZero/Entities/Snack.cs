namespace FomeZero.Entities;

public class Snack : EntityBase
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
}
