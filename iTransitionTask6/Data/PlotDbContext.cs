using Microsoft.EntityFrameworkCore;
using Plot.Domain;

namespace Plot.Data;

public class PlotDbContext(DbContextOptions<PlotDbContext> options) : DbContext(options)
{
    private const int MaxBoardTitle = 200;

    private const int MaxThumbnailBytes = 200_000;

    private const int MaxPageName = 100;

    private const int MaxUserName = 80;

    private const int MaxColorHex = 16;

    public DbSet<Board> Boards => Set<Board>();

    public DbSet<Page> Pages => Set<Page>();

    public DbSet<Stroke> Strokes => Set<Stroke>();

    public DbSet<BoardMember> BoardMembers => Set<BoardMember>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Board>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).HasMaxLength(MaxBoardTitle).IsRequired();
            e.Property(x => x.ThumbnailDataUrl).HasMaxLength(MaxThumbnailBytes);
            e.HasIndex(x => x.UpdatedAt);
        });

        b.Entity<Page>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(MaxPageName).IsRequired();
            e.HasOne(x => x.Board)
                .WithMany(x => x.Pages)
                .HasForeignKey(x => x.BoardId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => new { x.BoardId, x.Order });
        });

        b.Entity<Stroke>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.PayloadJson).IsRequired();
            e.Property(x => x.AuthorName).HasMaxLength(MaxUserName).IsRequired();
            e.Property(x => x.AuthorColor).HasMaxLength(MaxColorHex).IsRequired();
            e.HasOne(x => x.Page)
                .WithMany(x => x.Strokes)
                .HasForeignKey(x => x.PageId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => new { x.PageId, x.CreatedAt });
        });

        b.Entity<BoardMember>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.UserName).HasMaxLength(MaxUserName).IsRequired();
            e.Property(x => x.Color).HasMaxLength(MaxColorHex).IsRequired();
            e.HasOne(x => x.Board)
                .WithMany(x => x.Members)
                .HasForeignKey(x => x.BoardId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => new { x.BoardId, x.UserName }).IsUnique();
        });
    }
}
