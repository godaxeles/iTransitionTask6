using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Plot.Api;
using Plot.Data;
using Plot.Domain;

namespace Plot.Hubs;

public class BoardHub(PlotDbContext db, PresenceStore presence) : Hub
{
    private const int MaxBoardTitle = 200;

    private const string CtxBoardId = "boardId";

    private const string CtxUserName = "userName";

    private const string CtxColor = "color";

    private const string CtxRole = "role";

    public async Task<JoinResult> JoinBoard(Guid boardId, string userName)
    {
        if (string.IsNullOrWhiteSpace(userName))
            throw new HubException("User name is required");

        userName = userName.Trim();

        var board = await db.Boards
            .Include(b => b.Members)
            .FirstOrDefaultAsync(b => b.Id == boardId)
            ?? throw new HubException("Board not found");

        var member = board.Members.FirstOrDefault(m =>
            m.UserName.Equals(userName, StringComparison.OrdinalIgnoreCase));

        string color;
        BoardRole role;

        if (member is null)
        {
            color = presence.PickColor(boardId);
            role = board.DefaultRole;
            db.BoardMembers.Add(new BoardMember
            {
                BoardId = boardId,
                UserName = userName,
                Role = role,
                Color = color,
            });
            await db.SaveChangesAsync();
        }
        else
        {
            color = member.Color;
            role = member.Role;
            member.LastSeenAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
        }

        Context.Items[CtxBoardId] = boardId;
        Context.Items[CtxUserName] = userName;
        Context.Items[CtxColor] = color;
        Context.Items[CtxRole] = role;

        await Groups.AddToGroupAsync(Context.ConnectionId, boardId.ToString());
        presence.Join(boardId, Context.ConnectionId, userName, color);

        await BroadcastPresenceAsync(boardId);

        return new JoinResult(userName, color, role);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var leave = presence.Leave(Context.ConnectionId);
        if (leave is { } v)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, v.boardId.ToString());
            await BroadcastPresenceAsync(v.boardId);
        }
        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendCursor(double x, double y)
    {
        var boardId = RequireBoardId();
        presence.UpdateCursor(boardId, Context.ConnectionId, x, y);
        var userName = (string)Context.Items[CtxUserName]!;
        await Clients.OthersInGroup(boardId.ToString()).SendAsync("CursorMoved", userName, x, y);
    }

    public async Task LiveStroke(string strokeId, StrokeKind kind, string payloadJson)
    {
        var boardId = RequireBoardId();
        RequireEditor();
        var userName = (string)Context.Items[CtxUserName]!;
        var color = (string)Context.Items[CtxColor]!;
        await Clients.OthersInGroup(boardId.ToString())
            .SendAsync("StrokeLive", strokeId, kind, payloadJson, userName, color);
    }

    public async Task<StrokeDto> CommitStroke(Guid pageId, StrokeKind kind, string payloadJson)
    {
        var boardId = RequireBoardId();
        RequireEditor();

        var pageBoard = await db.Pages
            .Where(p => p.Id == pageId)
            .Select(p => (Guid?)p.BoardId)
            .FirstOrDefaultAsync();
        if (pageBoard != boardId)
            throw new HubException("Page does not belong to joined board");

        var userName = (string)Context.Items[CtxUserName]!;
        var color = (string)Context.Items[CtxColor]!;

        var stroke = new Stroke
        {
            PageId = pageId,
            Kind = kind,
            PayloadJson = payloadJson,
            AuthorName = userName,
            AuthorColor = color,
        };
        db.Strokes.Add(stroke);
        await TouchBoardAsync(boardId);

        var dto = new StrokeDto(stroke.Id, stroke.Kind, stroke.PayloadJson,
            stroke.AuthorName, stroke.AuthorColor, stroke.CreatedAt);
        await Clients.Group(boardId.ToString()).SendAsync("StrokeCommitted", pageId, dto);
        return dto;
    }

    public async Task EraseStrokes(IReadOnlyList<Guid> strokeIds)
    {
        var boardId = RequireBoardId();
        RequireEditor();
        if (strokeIds.Count == 0) return;

        var strokes = await db.Strokes
            .Where(s => strokeIds.Contains(s.Id) && s.Page.BoardId == boardId)
            .ToListAsync();
        foreach (var s in strokes) s.IsDeleted = true;
        await TouchBoardAsync(boardId);

        await Clients.Group(boardId.ToString())
            .SendAsync("StrokesErased", strokes.Select(s => s.Id).ToList());
    }

    public async Task RestoreStrokes(IReadOnlyList<Guid> strokeIds)
    {
        var boardId = RequireBoardId();
        RequireEditor();
        if (strokeIds.Count == 0) return;

        var strokes = await db.Strokes
            .Where(s => strokeIds.Contains(s.Id) && s.Page.BoardId == boardId)
            .ToListAsync();
        foreach (var s in strokes) s.IsDeleted = false;
        await TouchBoardAsync(boardId);

        await Clients.Group(boardId.ToString())
            .SendAsync("StrokesRestored", strokes.Select(s => s.Id).ToList());
    }

    public async Task<PageDto> AddPage(string? name)
    {
        var boardId = RequireBoardId();
        var role = (BoardRole)Context.Items[CtxRole]!;
        var board = await db.Boards.Include(b => b.Pages).FirstOrDefaultAsync(b => b.Id == boardId)
            ?? throw new HubException("Board not found");
        if (role < BoardRole.Editor || (role != BoardRole.Manager && !board.CanAddPages))
            throw new HubException("Not allowed to add pages");

        var order = board.Pages.Count == 0 ? 0 : board.Pages.Max(p => p.Order) + 1;
        var page = new Page
        {
            BoardId = boardId,
            Order = order,
            Name = string.IsNullOrWhiteSpace(name) ? $"Page {board.Pages.Count + 1}" : name.Trim(),
        };
        db.Pages.Add(page);
        board.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        var dto = new PageDto(page.Id, page.Order, page.Name, []);
        await Clients.Group(boardId.ToString()).SendAsync("PageAdded", dto);
        return dto;
    }

    public async Task DeletePage(Guid pageId)
    {
        var boardId = RequireBoardId();
        var role = (BoardRole)Context.Items[CtxRole]!;
        var board = await db.Boards.Include(b => b.Pages).FirstOrDefaultAsync(b => b.Id == boardId)
            ?? throw new HubException("Board not found");
        if (role < BoardRole.Editor || (role != BoardRole.Manager && !board.CanDeletePages))
            throw new HubException("Not allowed to delete pages");
        if (board.Pages.Count <= 1)
            throw new HubException("Cannot delete the last page");

        var page = board.Pages.FirstOrDefault(p => p.Id == pageId)
            ?? throw new HubException("Page not found");
        db.Pages.Remove(page);
        board.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        await Clients.Group(boardId.ToString()).SendAsync("PageDeleted", pageId);
    }

    public async Task ReorderPages(IReadOnlyList<Guid> pageIds)
    {
        var boardId = RequireBoardId();
        RequireEditor();
        var pages = await db.Pages.Where(p => p.BoardId == boardId).ToListAsync();
        var orderMap = pageIds.Select((id, i) => (id, i)).ToDictionary(x => x.id, x => x.i);
        foreach (var p in pages)
            if (orderMap.TryGetValue(p.Id, out var idx)) p.Order = idx;
        await TouchBoardAsync(boardId);
        await Clients.Group(boardId.ToString()).SendAsync("PagesReordered", pageIds);
    }

    public async Task RenameBoard(string title)
    {
        var boardId = RequireBoardId();
        RequireEditor();
        if (string.IsNullOrWhiteSpace(title)) throw new HubException("Title is required");
        title = title.Trim();
        if (title.Length > MaxBoardTitle) title = title[..MaxBoardTitle];

        var board = await db.Boards.FindAsync(boardId) ?? throw new HubException("Board not found");
        board.Title = title;
        board.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        await Clients.OthersInGroup(boardId.ToString()).SendAsync("BoardRenamed", title);
    }

    private Guid RequireBoardId()
    {
        if (Context.Items[CtxBoardId] is Guid id) return id;
        throw new HubException("Call JoinBoard first");
    }

    private void RequireEditor()
    {
        if (Context.Items[CtxRole] is BoardRole role && role >= BoardRole.Editor) return;
        throw new HubException("Viewer cannot modify the board");
    }

    private async Task TouchBoardAsync(Guid boardId)
    {
        await db.Boards
            .Where(b => b.Id == boardId)
            .ExecuteUpdateAsync(s => s.SetProperty(b => b.UpdatedAt, DateTime.UtcNow));
        await db.SaveChangesAsync();
    }

    private async Task BroadcastPresenceAsync(Guid boardId)
    {
        var snapshot = presence.Snapshot(boardId)
            .Select(p => new { userName = p.UserName, color = p.Color, x = p.CursorX, y = p.CursorY })
            .ToList();
        await Clients.Group(boardId.ToString()).SendAsync("PresenceUpdated", snapshot);
    }
}

public record JoinResult(string UserName, string Color, BoardRole Role);
