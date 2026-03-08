using System.Net;
using System.Net.Http.Headers;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HeatTheMap.Api.Controllers;

[ApiController]
[Route("api/camera")]
[Authorize]
public class CameraProxyController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<CameraProxyController> _logger;

    // Allowed private IP ranges for SSRF protection
    private static readonly (IPAddress Network, int PrefixLength)[] AllowedRanges =
    [
        (IPAddress.Parse("10.0.0.0"), 8),
        (IPAddress.Parse("172.16.0.0"), 12),
        (IPAddress.Parse("192.168.0.0"), 16),
        (IPAddress.Parse("127.0.0.0"), 8),
    ];

    public CameraProxyController(IHttpClientFactory httpClientFactory, ILogger<CameraProxyController> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    [HttpGet("proxy")]
    public async Task ProxyStream(
        [FromQuery] string url,
        [FromQuery] string? username = null,
        [FromQuery] string? password = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(url))
        {
            Response.StatusCode = 400;
            await Response.WriteAsJsonAsync(new { message = "URL is required" }, cancellationToken);
            return;
        }

        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
        {
            Response.StatusCode = 400;
            await Response.WriteAsJsonAsync(new { message = "Invalid URL format" }, cancellationToken);
            return;
        }

        // SSRF protection: only allow private IP ranges
        if (!await IsAllowedAddress(uri.Host))
        {
            _logger.LogWarning("Blocked proxy request to non-private IP: {Url}", url);
            Response.StatusCode = 403;
            await Response.WriteAsJsonAsync(new { message = "Only private network addresses are allowed" }, cancellationToken);
            return;
        }

        try
        {
            var client = _httpClientFactory.CreateClient("CameraProxy");
            var request = new HttpRequestMessage(HttpMethod.Get, uri);

            // Add Basic Auth if credentials provided
            if (!string.IsNullOrEmpty(username))
            {
                var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{username}:{password ?? ""}"));
                request.Headers.Authorization = new AuthenticationHeaderValue("Basic", credentials);
            }

            var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                Response.StatusCode = (int)response.StatusCode;
                await Response.WriteAsJsonAsync(new { message = $"Upstream returned {response.StatusCode}" }, cancellationToken);
                return;
            }

            // Forward content type
            Response.ContentType = response.Content.Headers.ContentType?.ToString() ?? "application/octet-stream";
            Response.StatusCode = 200;

            // Stream the response
            await using var sourceStream = await response.Content.ReadAsStreamAsync(cancellationToken);
            await sourceStream.CopyToAsync(Response.Body, cancellationToken);
        }
        catch (TaskCanceledException)
        {
            // Client disconnected or timeout - normal for streams
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Failed to proxy camera stream from {Url}", url);
            if (!Response.HasStarted)
            {
                Response.StatusCode = 502;
                await Response.WriteAsJsonAsync(new { message = "Failed to connect to camera" }, cancellationToken);
            }
        }
    }

    private static async Task<bool> IsAllowedAddress(string host)
    {
        try
        {
            var addresses = await Dns.GetHostAddressesAsync(host);
            return addresses.Any(addr => AllowedRanges.Any(range => IsInRange(addr, range.Network, range.PrefixLength)));
        }
        catch
        {
            return false;
        }
    }

    private static bool IsInRange(IPAddress address, IPAddress network, int prefixLength)
    {
        var addrBytes = address.GetAddressBytes();
        var netBytes = network.GetAddressBytes();

        if (addrBytes.Length != netBytes.Length)
            return false;

        var fullBytes = prefixLength / 8;
        var remainingBits = prefixLength % 8;

        for (var i = 0; i < fullBytes; i++)
        {
            if (addrBytes[i] != netBytes[i])
                return false;
        }

        if (remainingBits > 0 && fullBytes < addrBytes.Length)
        {
            var mask = (byte)(0xFF << (8 - remainingBits));
            if ((addrBytes[fullBytes] & mask) != (netBytes[fullBytes] & mask))
                return false;
        }

        return true;
    }
}
