namespace Plot.Domain;

public class Board
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public required string Title { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public string? ThumbnailDataUrl { get; set; }

    public BoardRole DefaultRole { get; set; } = BoardRole.Editor;

    public bool CanAddPages { get; set; } = true;

    public bool CanDeletePages { get; set; } = true;

    public bool CanManagePermissions { get; set; }

    public bool CanExport { get; set; } = true;

    public List<Page> Pages { get; set; } = [];

    public List<BoardMember> Members { get; set; } = [];
}
