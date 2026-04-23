using Plot.Domain;

namespace Plot.Api;

public record BoardSummaryDto(
    Guid Id,
    string Title,
    string? ThumbnailDataUrl,
    DateTime UpdatedAt,
    int PageCount,
    int CollaboratorCount);

public record BoardDetailDto(
    Guid Id,
    string Title,
    DateTime UpdatedAt,
    BoardRole DefaultRole,
    bool CanAddPages,
    bool CanDeletePages,
    bool CanManagePermissions,
    bool CanExport,
    IReadOnlyList<PageDto> Pages);

public record PageDto(
    Guid Id,
    int Order,
    string Name,
    IReadOnlyList<StrokeDto> Strokes);

public record StrokeDto(
    Guid Id,
    StrokeKind Kind,
    string PayloadJson,
    string AuthorName,
    string AuthorColor,
    DateTime CreatedAt);

public record CreateBoardRequest(string? Title);

public record UpdateBoardRequest(string? Title, string? ThumbnailDataUrl);

public record CreatePageRequest(string? Name);

public record UpdatePageRequest(string Name);

public record ReorderPagesRequest(IReadOnlyList<Guid> PageIds);

public record PermissionsDto(
    BoardRole DefaultRole,
    bool CanAddPages,
    bool CanDeletePages,
    bool CanManagePermissions,
    bool CanExport,
    IReadOnlyList<MemberDto> Members);

public record MemberDto(
    string UserName,
    BoardRole Role,
    string Color,
    DateTime FirstSeenAt,
    DateTime LastSeenAt);

public record UpdatePermissionsRequest(
    BoardRole? DefaultRole,
    bool? CanAddPages,
    bool? CanDeletePages,
    bool? CanManagePermissions,
    bool? CanExport,
    IReadOnlyList<MemberRoleUpdate>? MemberOverrides);

public record MemberRoleUpdate(string UserName, BoardRole Role);
