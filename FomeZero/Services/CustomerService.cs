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

    public async Task<CustomerDto> CreateAsync(Customer customer)
    {
        customer.WhatsApp = CleanWhatsApp(customer.WhatsApp);
        var created = await _repository.CreateAsync(customer);
        return MapToDto(created);
    }

    public async Task<CustomerDto?> UpdateAsync(Guid id, Customer customer)
    {
        var existingCustomer = await _repository.GetByIdAsync(id);
        if (existingCustomer == null)
            return null;

        existingCustomer.Name = customer.Name;
        existingCustomer.WhatsApp = CleanWhatsApp(customer.WhatsApp);
        existingCustomer.Active = customer.Active;

        var updated = await _repository.UpdateAsync(existingCustomer);
        return MapToDto(updated!);
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
            CreatedAt = customer.CreatedAt,
            UpdatedAt = customer.UpdatedAt
        };
    }
}
