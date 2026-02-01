using FomeZero.DTOs;

namespace FomeZero.Interfaces;

public interface IDashboardService
{
    Task<DashboardStatsResponse> GetStatsAsync(DateTime? startDate, DateTime? endDate);
}
