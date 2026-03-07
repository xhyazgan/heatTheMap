using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using HeatTheMap.Api.DTOs;
using Microsoft.IdentityModel.Tokens;

namespace HeatTheMap.Api.Services;

public class AuthService : IAuthService
{
    private readonly IConfiguration _configuration;
    private readonly Dictionary<string, string> _refreshTokens = new(); // In-memory for MVP

    public AuthService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<LoginResponseDto?> AuthenticateAsync(string username, string password)
    {
        // Get credentials from configuration
        var configUsername = _configuration["Auth:DefaultUsername"] ?? "admin";
        var configPassword = _configuration["Auth:DefaultPassword"] ?? "password";
        
        if (username != configUsername || password != configPassword)
            return null;

        var token = GenerateJwtToken(username);
        var refreshToken = GenerateRefreshToken();
        var expiresAt = DateTime.UtcNow.AddHours(1);

        // Store refresh token
        _refreshTokens[refreshToken] = username;

        return new LoginResponseDto(token, refreshToken, expiresAt, username);
    }

    public async Task<LoginResponseDto?> RefreshTokenAsync(string refreshToken)
    {
        if (!_refreshTokens.TryGetValue(refreshToken, out var username))
            return null;

        var token = GenerateJwtToken(username);
        var newRefreshToken = GenerateRefreshToken();
        var expiresAt = DateTime.UtcNow.AddHours(1);

        // Replace old refresh token
        _refreshTokens.Remove(refreshToken);
        _refreshTokens[newRefreshToken] = username;

        return new LoginResponseDto(token, newRefreshToken, expiresAt, username);
    }

    private string GenerateJwtToken(string username)
    {
        var key = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured");
        var issuer = _configuration["Jwt:Issuer"] ?? "HeatTheMap.Api";
        var audience = _configuration["Jwt:Audience"] ?? "HeatTheMap.Web";

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, "Admin"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Sub, username)
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}
