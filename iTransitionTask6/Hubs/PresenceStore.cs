using System.Collections.Concurrent;

namespace Plot.Hubs;

public record PresenceEntry(
    string ConnectionId,
    string UserName,
    string Color,
    double CursorX,
    double CursorY);

public class PresenceStore
{
    private static readonly string[] UserColorPalette =
    {
        "#FF6B5B",
        "#F5B455",
        "#4FD1A5",
        "#5BA3FF",
        "#9B7BFF",
        "#FF7BB5",
    };

    private readonly ConcurrentDictionary<Guid, ConcurrentDictionary<string, PresenceEntry>> _boards = new();

    public PresenceEntry Join(Guid boardId, string connectionId, string userName, string color)
    {
        var entry = new PresenceEntry(connectionId, userName, color, 0, 0);
        _boards.GetOrAdd(boardId, _ => new())[connectionId] = entry;
        return entry;
    }

    public PresenceEntry? Leave(Guid boardId, string connectionId)
    {
        if (!_boards.TryGetValue(boardId, out var m)) return null;
        m.TryRemove(connectionId, out var entry);
        if (m.IsEmpty) _boards.TryRemove(boardId, out _);
        return entry;
    }

    public (Guid boardId, PresenceEntry entry)? Leave(string connectionId)
    {
        foreach (var (boardId, m) in _boards)
        {
            if (m.TryRemove(connectionId, out var entry))
            {
                if (m.IsEmpty) _boards.TryRemove(boardId, out _);
                return (boardId, entry);
            }
        }
        return null;
    }

    public void UpdateCursor(Guid boardId, string connectionId, double x, double y)
    {
        if (_boards.TryGetValue(boardId, out var m) && m.TryGetValue(connectionId, out var entry))
        {
            m[connectionId] = entry with { CursorX = x, CursorY = y };
        }
    }

    public IReadOnlyList<PresenceEntry> Snapshot(Guid boardId) =>
        _boards.TryGetValue(boardId, out var m) ? m.Values.ToList() : [];

    public string PickColor(Guid boardId)
    {
        var used = Snapshot(boardId).Select(p => p.Color).ToHashSet();
        return UserColorPalette.FirstOrDefault(c => !used.Contains(c))
            ?? UserColorPalette[Random.Shared.Next(UserColorPalette.Length)];
    }
}
