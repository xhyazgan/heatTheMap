using HeatTheMap.Api.DTOs;

namespace HeatTheMap.Api.Services;

public interface IAuthService
{
    Task<LoginResponseDto?> AuthenticateAsync(string username, string password);
    Task<LoginResponseDto?> RefreshTokenAsync(string refreshToken);
}
