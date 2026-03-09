using Microsoft.AspNetCore.Mvc;
using RotasCriptografadas.RouteEncryption.Logic.Interface;

namespace RotasCriptografadas.Api.Controllers;

[ApiController]
[Route("api/rotas")]
public class RotasSegurasController : ControllerBase
{
    private readonly IRotaEncryptionService _rotaEncryptionService;

    public RotasSegurasController(IRotaEncryptionService rotaEncryptionService)
    {
        _rotaEncryptionService = rotaEncryptionService;
    }

    [HttpPost("criptografar")]
    public ActionResult<CriptografarRotaResponse> Criptografar([FromBody] CriptografarRotaRequest? request)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Path))
        {
            return BadRequest("Path obrigatorio.");
        }

        var caminhoNormalizado = NormalizarPath(request.Path);
        var token = _rotaEncryptionService.GerarToken(caminhoNormalizado);

        return Ok(new CriptografarRotaResponse(token));
    }

    [HttpGet("{token}")]
    public ActionResult<ResolverRotaResponse> Resolver(string token)
    {
        if (!_rotaEncryptionService.TentarResolverToken(token, out var caminho))
        {
            return NotFound();
        }

        return Ok(new ResolverRotaResponse(caminho));
    }

    private static string NormalizarPath(string path)
    {
        if (string.IsNullOrWhiteSpace(path))
        {
            return "/";
        }

        return path.StartsWith("/", StringComparison.Ordinal) ? path : "/" + path;
    }

    public sealed record CriptografarRotaRequest(string Path);

    public sealed record CriptografarRotaResponse(string Token);

    public sealed record ResolverRotaResponse(string Path);
}

