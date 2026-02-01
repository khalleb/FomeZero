namespace FomeZero.DTOs;

public class CustomerDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string WhatsApp { get; set; } = string.Empty;
    public string WhatsAppFormatted { get; set; } = string.Empty;
    public bool Active { get; set; }
    public decimal Credit { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public static string FormatWhatsApp(string? whatsApp)
    {
        if (string.IsNullOrWhiteSpace(whatsApp))
            return string.Empty;

        // Remove caracteres não numéricos
        var digits = new string(whatsApp.Where(char.IsDigit).ToArray());

        // Formato: (XX) XXXXX-XXXX para 11 dígitos ou (XX) XXXX-XXXX para 10 dígitos
        if (digits.Length == 11)
        {
            return $"({digits[..2]}) {digits[2..7]}-{digits[7..]}";
        }
        else if (digits.Length == 10)
        {
            return $"({digits[..2]}) {digits[2..6]}-{digits[6..]}";
        }

        // Se não tem formato válido, retorna como está
        return whatsApp;
    }
}
