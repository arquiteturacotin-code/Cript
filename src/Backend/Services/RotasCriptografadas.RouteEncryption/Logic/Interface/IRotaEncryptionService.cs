using System.Diagnostics.CodeAnalysis;

namespace RotasCriptografadas.RouteEncryption.Logic.Interface;

public interface IRotaEncryptionService
{
    string GerarToken(string caminho);

    bool TentarResolverToken(string token, [NotNullWhen(true)] out string? caminho);
}

