using Microsoft.EntityFrameworkCore;
using Plot.Api;
using Plot.Data;
using Plot.Hubs;

const int SignalRMaxReceiveBytes = 256 * 1024;

const int DefaultPostgresPort = 5432;

const string ProviderSqlite = "Sqlite";

const string ProviderPostgres = "Postgres";

const string ConnectionStringKey = "Default";

const string DatabaseProviderKey = "Database:Provider";

const string DatabaseUrlEnv = "DATABASE_URL";

const string SqliteDefaultConnection = "Data Source=plot.db";

const string DevCorsPolicy = "PlotDevCors";

const string HubPath = "/hubs/board";

const string SpaDistRelativePath = "wwwroot/dist";

const string SpaIndexFile = "index.html";

const string PostgresSchemeShort = "postgres://";

const string PostgresSchemeLong = "postgresql://";

var builder = WebApplication.CreateBuilder(args);

var provider = builder.Configuration[DatabaseProviderKey] ?? ProviderSqlite;

var connectionString = builder.Configuration.GetConnectionString(ConnectionStringKey)
    ?? (provider.Equals(ProviderPostgres, StringComparison.OrdinalIgnoreCase)
        ? Environment.GetEnvironmentVariable(DatabaseUrlEnv)
            ?? throw new InvalidOperationException("Postgres requires DATABASE_URL or ConnectionStrings:Default")
        : SqliteDefaultConnection);

builder.Services.AddDbContext<PlotDbContext>(options =>
{
    if (provider.Equals(ProviderPostgres, StringComparison.OrdinalIgnoreCase))
    {
        options.UseNpgsql(NormalizePostgresUrl(connectionString));
    }
    else
    {
        options.UseSqlite(connectionString);
    }
});

builder.Services.AddSignalR(options =>
{
    options.MaximumReceiveMessageSize = SignalRMaxReceiveBytes;
});

builder.Services.AddSingleton<PresenceStore>();

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy(DevCorsPolicy, policy => policy
        .WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PlotDbContext>();
    await db.Database.MigrateAsync();

    if (provider.Equals(ProviderSqlite, StringComparison.OrdinalIgnoreCase))
    {
        await db.Database.ExecuteSqlRawAsync("PRAGMA journal_mode=WAL;");
        await db.Database.ExecuteSqlRawAsync("PRAGMA synchronous=NORMAL;");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseCors(DevCorsPolicy);
}

var distPath = Path.Combine(app.Environment.ContentRootPath, SpaDistRelativePath);

if (Directory.Exists(distPath))
{
    var distFiles = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(distPath);
    app.UseDefaultFiles(new DefaultFilesOptions { FileProvider = distFiles, RequestPath = "" });
    app.UseStaticFiles(new StaticFileOptions { FileProvider = distFiles, RequestPath = "" });
}

app.MapBoardEndpoints();
app.MapPageEndpoints();
app.MapPermissionEndpoints();

app.MapHub<BoardHub>(HubPath);

app.MapFallback(context =>
{
    var indexPath = Path.Combine(distPath, SpaIndexFile);
    if (File.Exists(indexPath))
    {
        context.Response.ContentType = "text/html";
        return context.Response.SendFileAsync(indexPath);
    }
    context.Response.StatusCode = StatusCodes.Status404NotFound;
    return context.Response.WriteAsync(
        "Client build not found. In dev, use http://localhost:5173. For prod: cd client && npm run build");
});

app.Run();
return;

static string NormalizePostgresUrl(string raw)
{
    if (!raw.StartsWith(PostgresSchemeShort) && !raw.StartsWith(PostgresSchemeLong))
        return raw;

    var uri = new Uri(raw);
    var userInfo = uri.UserInfo.Split(':', 2);
    var database = uri.AbsolutePath.TrimStart('/');
    var csBuilder = new Npgsql.NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = uri.Port > 0 ? uri.Port : DefaultPostgresPort,
        Username = Uri.UnescapeDataString(userInfo[0]),
        Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty,
        Database = database,
        SslMode = Npgsql.SslMode.Require,
    };
    return csBuilder.ConnectionString;
}
