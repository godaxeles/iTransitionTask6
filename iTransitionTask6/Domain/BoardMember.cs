namespace Plot.Domain;

public class BoardMember
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid BoardId { get; set; }

    public Board Board { get; set; } = null!;

    public required string UserName { get; set; }

    public BoardRole Role { get; set; } = BoardRole.Editor;

    public required string Color { get; set; }

    public DateTime FirstSeenAt { get; set; } = DateTime.UtcNow;

    public DateTime LastSeenAt { get; set; } = DateTime.UtcNow;
}
