using Microsoft.EntityFrameworkCore;
using Plot.Data;
using Plot.Domain;

namespace Plot.Api;

public static class PageEndpoints
{
    public static void MapPageEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/boards/{boardId:guid}/pages", async (Guid boardId, CreatePageRequest req, PlotDbContext db) =>
        {
            var board = await db.Boards.Include(b => b.Pages).FirstOrDefaultAsync(b => b.Id == boardId);
            if (board is null) return Results.NotFound();

            var nextOrder = board.Pages.Count == 0 ? 0 : board.Pages.Max(p => p.Order) + 1;
            var name = string.IsNullOrWhiteSpace(req.Name) ? $"Page {board.Pages.Count + 1}" : req.Name.Trim();
            var page = new Page { BoardId = boardId, Order = nextOrder, Name = name };
            db.Pages.Add(page);
            board.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();

            return Results.Created(
                $"/api/pages/{page.Id}",
                new PageDto(page.Id, page.Order, page.Name, []));
        });

        app.MapPatch("/api/boards/{boardId:guid}/pages/reorder", async (Guid boardId, ReorderPagesRequest req, PlotDbContext db) =>
        {
            var pages = await db.Pages.Where(p => p.BoardId == boardId).ToListAsync();
            if (pages.Count == 0) return Results.NotFound();

            var orderMap = req.PageIds
                .Select((id, idx) => (id, idx))
                .ToDictionary(x => x.id, x => x.idx);

            foreach (var p in pages)
            {
                if (orderMap.TryGetValue(p.Id, out var idx))
                    p.Order = idx;
            }

            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        app.MapPatch("/api/pages/{id:guid}", async (Guid id, UpdatePageRequest req, PlotDbContext db) =>
        {
            var page = await db.Pages.FindAsync(id);
            if (page is null) return Results.NotFound();
            if (string.IsNullOrWhiteSpace(req.Name)) return Results.BadRequest("Name is required");
            page.Name = req.Name.Trim();
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        app.MapDelete("/api/pages/{id:guid}", async (Guid id, PlotDbContext db) =>
        {
            var page = await db.Pages.FindAsync(id);
            if (page is null) return Results.NotFound();
            db.Pages.Remove(page);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
