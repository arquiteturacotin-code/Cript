namespace RotasCriptografadas.RouteEncryption.Logic.Services;

public sealed class RouteEncryptionService : IRotaEncryptionService
{
    private readonly byte[] _chaveAes;
    private readonly byte[] _chaveHmac;

    public RouteEncryptionService(IConfiguration configuration)
    {
        var secao = configuration.GetSection("CriptografiaRotas");
        var chaveAesBase64 = secao["AesKey"];
        var chaveHmacBase64 = secao["HmacKey"];

        if (!string.IsNullOrWhiteSpace(chaveAesBase64) &&
            !string.IsNullOrWhiteSpace(chaveHmacBase64))
        {
            _chaveAes = Convert.FromBase64String(chaveAesBase64);
            _chaveHmac = Convert.FromBase64String(chaveHmacBase64);
            return;
        }

        using var aes = Aes.Create();
        aes.KeySize = 256;
        aes.GenerateKey();
        _chaveAes = aes.Key;

        using var hmac = new HMACSHA256();
        _chaveHmac = hmac.Key;
    }

    public string GerarToken(string caminho)
    {
        if (string.IsNullOrWhiteSpace(caminho))
        {
            throw new ArgumentException("Caminho nao pode ser vazio.", nameof(caminho));
        }

        var textoPlano = Encoding.UTF8.GetBytes(caminho);

        byte[] iv;
        byte[] bytesCifrados;

        using (var aes = Aes.Create())
        {
            aes.KeySize = 256;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;
            aes.Key = _chaveAes;
            aes.GenerateIV();
            iv = aes.IV;

            using var criptografador = aes.CreateEncryptor();
            bytesCifrados = criptografador.TransformFinalBlock(textoPlano, 0, textoPlano.Length);
        }

        var payload = new byte[iv.Length + bytesCifrados.Length];
        Buffer.BlockCopy(iv, 0, payload, 0, iv.Length);
        Buffer.BlockCopy(bytesCifrados, 0, payload, iv.Length, bytesCifrados.Length);

        var payloadBase64Url = Base64UrlEncode(payload);
        var assinatura = CalcularAssinatura(payload);

        return $"{payloadBase64Url}.{assinatura}";
    }

    public bool TentarResolverToken(string token, out string? caminho)
    {
        caminho = string.Empty;

        if (string.IsNullOrWhiteSpace(token))
        {
            return false;
        }

        var partes = token.Split('.', 2);
        if (partes.Length != 2)
        {
            return false;
        }

        var payloadBase64Url = partes[0];
        var assinatura = partes[1];

        var payload = Base64UrlDecode(payloadBase64Url);
        var assinaturaEsperada = CalcularAssinatura(payload);

        if (!CompararAssinaturas(assinatura, assinaturaEsperada))
        {
            return false;
        }

        using var aes = Aes.Create();
        aes.KeySize = 256;
        aes.Mode = CipherMode.CBC;
        aes.Padding = PaddingMode.PKCS7;
        aes.Key = _chaveAes;

        var tamanhoBloco = aes.BlockSize / 8;
        if (payload.Length <= tamanhoBloco)
        {
            return false;
        }

        var iv = new byte[tamanhoBloco];
        Buffer.BlockCopy(payload, 0, iv, 0, tamanhoBloco);
        aes.IV = iv;

        var tamanhoCifrado = payload.Length - tamanhoBloco;
        var bytesCifrados = new byte[tamanhoCifrado];
        Buffer.BlockCopy(payload, tamanhoBloco, bytesCifrados, 0, tamanhoCifrado);

        using var descriptografador = aes.CreateDecryptor();
        var textoPlano = descriptografador.TransformFinalBlock(bytesCifrados, 0, bytesCifrados.Length);
        caminho = Encoding.UTF8.GetString(textoPlano);

        return caminho.StartsWith("/", StringComparison.Ordinal);
    }

    private string CalcularAssinatura(byte[] dados)
    {
        using var hmac = new HMACSHA256(_chaveHmac);
        var hash = hmac.ComputeHash(dados);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static bool CompararAssinaturas(string a, string b)
    {
        if (a.Length != b.Length)
        {
            return false;
        }

        var resultado = 0;

        for (var i = 0; i < a.Length; i++)
        {
            resultado |= a[i] ^ b[i];
        }

        return resultado == 0;
    }

    private static string Base64UrlEncode(byte[] dados)
    {
        var base64 = Convert.ToBase64String(dados);
        return base64
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
    }

    private static byte[] Base64UrlDecode(string texto)
    {
        var base64 = texto
            .Replace("-", "+")
            .Replace("_", "/");

        var complemento = base64.Length % 4;
        if (complemento != 0)
        {
            base64 = base64.PadRight(base64.Length + (4 - complemento), '=');
        }

        return Convert.FromBase64String(base64);
    }
}

