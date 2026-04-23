using Microsoft.EntityFrameworkCore;
using Plot.Data;

namespace Plot.Api;

public static class PermissionEndpoints
{
    private const string PermissionsRoute = "/api/boards/{boardId:guid}/permissions";

    public static void MapPermissionEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet(PermissionsRoute, async (Guid boardId, PlotDbContext db) =>
        {
            var board = await db.Boards
                .Include(b => b.Members)
                .FirstOrDefaultAsync(b => b.Id == boardId);
            if (board is null) return Results.NotFound();

            return Results.Ok(new PermissionsDto(
                board.DefaultRole,
                board.CanAddPages,
                board.CanDeletePages,
                board.CanManagePermissions,
                board.CanExport,
                board.Members.Select(m => new MemberDto(
                    m.UserName, m.Role, m.Color, m.FirstSeenAt, m.LastSeenAt)).ToList()));
        });

        app.MapPatch(PermissionsRoute, async (Guid boardId, UpdatePermissionsRequest req, PlotDbContext db) =>
        {
            var board = await db.Boards
                .Include(b => b.Members)
                .FirstOrDefaultAsync(b => b.Id == boardId);
            if (board is null) return Results.NotFound();

            if (req.DefaultRole is { } dr) board.DefaultRole = dr;
            if (req.CanAddPages is { } cap) board.CanAddPages = cap;
            if (req.CanDeletePages is { } cdp) board.CanDeletePages = cdp;
            if (req.CanManagePermissions is { } cmp) board.CanManagePermissions = cmp;
            if (req.CanExport is { } ce) board.CanExport = ce;

            if (req.MemberOverrides is { } overrides)
            {
                foreach (var o in overrides)
                {
                    var member = board.Members.FirstOrDefault(m =>
                        m.UserName.Equals(o.UserName, StringComparison.OrdinalIgnoreCase));
                    if (member is not null) member.Role = o.Role;
                }
            }

            board.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
