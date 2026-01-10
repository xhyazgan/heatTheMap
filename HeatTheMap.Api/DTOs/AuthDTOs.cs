namespace HeatTheMap.Api.DTOs;

public record LoginRequestDto(
    string Username,
    string Password
);

public record LoginResponseDto(
    string Token,
    string RefreshToken,
    DateTime ExpiresAt,
    string Username
);

public record RefreshTokenRequestDto(
    string RefreshToken
);
