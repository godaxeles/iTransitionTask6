namespace Plot.Domain;

public class Stroke
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid PageId { get; set; }

    public Page Page { get; set; } = null!;

    public StrokeKind Kind { get; set; }

    public required string PayloadJson { get; set; }

    public required string AuthorName { get; set; }

    public required string AuthorColor { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsDeleted { get; set; }
}
