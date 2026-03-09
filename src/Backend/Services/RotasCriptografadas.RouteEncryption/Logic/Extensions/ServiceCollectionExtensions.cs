namespace RotasCriptografadas.RouteEncryption.Logic.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddRouteEncryption(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IRotaEncryptionService, RouteEncryptionService>();
        return services;
    }
}

