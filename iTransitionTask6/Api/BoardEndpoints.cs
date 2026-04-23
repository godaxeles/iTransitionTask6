using Microsoft.EntityFrameworkCore;
using Plot.Data;
using Plot.Domain;

namespace Plot.Api;

public static class BoardEndpoints
{
    private const string DefaultBoardTitle = "Untitled board";

    private const string DefaultPageName = "Page 1";

    private const string BoardsRoute = "/api/boards";

    public static void MapBoardEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup(BoardsRoute);

        group.MapGet("", async (PlotDbContext db) =>
        {
            var boards = await db.Boards
                .OrderByDescending(b => b.UpdatedAt)
                .Select(b => new BoardSummaryDto(
                    b.Id,
                    b.Title,
                    b.ThumbnailDataUrl,
                    b.UpdatedAt,
                    b.Pages.Count,
                    b.Members.Count))
                .ToListAsync();
            return Results.Ok(boards);
        });

        group.MapPost("", async (CreateBoardRequest req, PlotDbContext db) =>
        {
            var title = string.IsNullOrWhiteSpace(req.Title) ? DefaultBoardTitle : req.Title.Trim();
            var board = new Board { Title = title };
            board.Pages.Add(new Page { Name = DefaultPageName, Order = 0 });
            db.Boards.Add(board);
            await db.SaveChangesAsync();
            return Results.Created($"{BoardsRoute}/{board.Id}", await LoadDetailAsync(db, board.Id));
        });

        group.MapGet("/{id:guid}", async (Guid id, PlotDbContext db) =>
        {
            var dto = await LoadDetailAsync(db, id);
            return dto is null ? Results.NotFound() : Results.Ok(dto);
        });

        group.MapPatch("/{id:guid}", async (Guid id, UpdateBoardRequest req, PlotDbContext db) =>
        {
            var board = await db.Boards.FindAsync(id);
            if (board is null) return Results.NotFound();

            if (!string.IsNullOrWhiteSpace(req.Title))
                board.Title = req.Title.Trim();

            if (req.ThumbnailDataUrl is not null)
                board.ThumbnailDataUrl = req.ThumbnailDataUrl;

            board.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        group.MapDelete("/{id:guid}", async (Guid id, PlotDbContext db) =>
        {
            var board = await db.Boards.FindAsync(id);
            if (board is null) return Results.NotFound();
            db.Boards.Remove(board);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }

    internal static async Task<BoardDetailDto?> LoadDetailAsync(PlotDbContext db, Guid id)
    {
        var board = await db.Boards
            .Include(b => b.Pages.OrderBy(p => p.Order))
            .ThenInclude(p => p.Strokes.Where(s => !s.IsDeleted).OrderBy(s => s.CreatedAt))
            .FirstOrDefaultAsync(b => b.Id == id);

        if (board is null) return null;

        return new BoardDetailDto(
            board.Id,
            board.Title,
            board.UpdatedAt,
            board.DefaultRole,
            board.CanAddPages,
            board.CanDeletePages,
            board.CanManagePermissions,
            board.CanExport,
            board.Pages.Select(p => new PageDto(
                p.Id,
                p.Order,
                p.Name,
                p.Strokes.Select(s => new StrokeDto(
                    s.Id, s.Kind, s.PayloadJson, s.AuthorName, s.AuthorColor, s.CreatedAt
                )).ToList())).ToList());
    }
}
