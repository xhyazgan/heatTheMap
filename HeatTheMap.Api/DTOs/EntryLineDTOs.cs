namespace HeatTheMap.Api.DTOs;

public record EntryLineDto(
    int Id,
    int StoreId,
    double StartX,
    double StartY,
    double EndX,
    double EndY,
    string InDirection,
    bool IsActive,
    DateTime CreatedAt
);

public record CreateEntryLineDto(
    int StoreId,
    double StartX,
    double StartY,
    double EndX,
    double EndY,
    string InDirection
);

public record UpdateEntryLineDto(
    double StartX,
    double StartY,
    double EndX,
    double EndY,
    string InDirection,
    bool IsActive
);
