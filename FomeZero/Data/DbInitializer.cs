using FomeZero.Entities;
using Microsoft.EntityFrameworkCore;

namespace FomeZero.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(AppDbContext context)
    {
        await SeedPaymentMethodsAsync(context);
        await SeedAdminUserAsync(context);
    }

    private static async Task SeedPaymentMethodsAsync(AppDbContext context)
    {
        if (await context.PaymentMethods.AnyAsync())
            return;

        var paymentMethods = new List<PaymentMethod>
        {
            new() { Id = Guid.NewGuid(), Name = "Dinheiro", Active = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), Name = "PIX", Active = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), Name = "Cartão de Débito", Active = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), Name = "Cartão de Crédito", Active = true, CreatedAt = DateTime.UtcNow }
        };

        context.PaymentMethods.AddRange(paymentMethods);
        await context.SaveChangesAsync();

        Console.WriteLine("Formas de pagamento criadas com sucesso!");
    }

    private static async Task SeedAdminUserAsync(AppDbContext context)
    {
        if (await context.Users.AnyAsync())
            return;

        var adminUser = new User
        {
            Id = Guid.NewGuid(),
            Name = "Admin",
            Email = "admin@fomezero.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
            Active = true,
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(adminUser);
        await context.SaveChangesAsync();

        Console.WriteLine("Usuario admin criado com sucesso!");
        Console.WriteLine("Email: admin@fomezero.com");
        Console.WriteLine("Senha: 123456");
    }
}
