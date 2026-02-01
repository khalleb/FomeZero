using FomeZero.DTOs;
using FomeZero.Entities;
using FomeZero.Interfaces;

namespace FomeZero.Services;

public class CustomerService : ICustomerService
{
    private readonly ICustomerRepository _repository;

    public CustomerService(ICustomerRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<CustomerDto>> GetAllAsync()
    {
        var customers = await _repository.GetAllAsync();
        return customers.Select(MapToDto);
    }

    public async Task<CustomerDto?> GetByIdAsync(Guid id)
    {
        var customer = await _repository.GetByIdAsync(id);
        return customer == null ? null : MapToDto(customer);
    }

    public async Task<(CustomerDto? Customer, string? Error)> CreateAsync(Customer customer)
    {
        // Validar nome duplicado
        var existingByName = await _repository.GetByNameAsync(customer.Name);
        if (existingByName != null)
            return (null, "Já existe um cliente cadastrado com este nome.");

        // Limpar e validar WhatsApp duplicado
        customer.WhatsApp = CleanWhatsApp(customer.WhatsApp);
        if (!string.IsNullOrWhiteSpace(customer.WhatsApp))
        {
            var existingByWhatsApp = await _repository.GetByWhatsAppAsync(customer.WhatsApp);
            if (existingByWhatsApp != null)
                return (null, "Já existe um cliente cadastrado com este número de WhatsApp.");
        }

        var created = await _repository.CreateAsync(customer);
        return (MapToDto(created), null);
    }

    public async Task<(CustomerDto? Customer, string? Error)> UpdateAsync(Guid id, Customer customer)
    {
        var existingCustomer = await _repository.GetByIdAsync(id);
        if (existingCustomer == null)
            return (null, "Cliente não encontrado.");

        // Validar nome duplicado (excluindo o próprio registro)
        var existingByName = await _repository.GetByNameAsync(customer.Name, id);
        if (existingByName != null)
            return (null, "Já existe um cliente cadastrado com este nome.");

        // Limpar e validar WhatsApp duplicado (excluindo o próprio registro)
        var cleanedWhatsApp = CleanWhatsApp(customer.WhatsApp);
        if (!string.IsNullOrWhiteSpace(cleanedWhatsApp))
        {
            var existingByWhatsApp = await _repository.GetByWhatsAppAsync(cleanedWhatsApp, id);
            if (existingByWhatsApp != null)
                return (null, "Já existe um cliente cadastrado com este número de WhatsApp.");
        }

        existingCustomer.Name = customer.Name;
        existingCustomer.WhatsApp = cleanedWhatsApp;
        existingCustomer.Active = customer.Active;

        var updated = await _repository.UpdateAsync(existingCustomer);
        return (MapToDto(updated!), null);
    }

    private static string? CleanWhatsApp(string? whatsApp)
    {
        if (string.IsNullOrWhiteSpace(whatsApp))
            return null;

        return new string(whatsApp.Where(char.IsDigit).ToArray());
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        return await _repository.DeleteAsync(id);
    }

    private static CustomerDto MapToDto(Customer customer)
    {
        return new CustomerDto
        {
            Id = customer.Id,
            Name = customer.Name,
            WhatsApp = customer.WhatsApp,
            WhatsAppFormatted = CustomerDto.FormatWhatsApp(customer.WhatsApp),
            Active = customer.Active,
            Credit = customer.Credit,
            CreatedAt = customer.CreatedAt,
            UpdatedAt = customer.UpdatedAt
        };
    }
}
