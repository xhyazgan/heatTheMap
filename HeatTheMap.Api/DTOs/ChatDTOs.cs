namespace HeatTheMap.Api.DTOs;

public record ChatRequestDto(
    string Query,
    int StoreId
);

public record ChatResponseDto(
    string Message
);

// Ollama API models
public record OllamaRequest(
    string Model,
    List<OllamaMessage> Messages,
    List<OllamaTool>? Tools = null,
    bool Stream = false
);

public record OllamaMessage(
    string Role,
    string Content,
    List<OllamaToolCall>? ToolCalls = null
);

public record OllamaToolCall(
    string Id,
    string Type,
    OllamaFunction Function
);

public record OllamaFunction(
    string Name,
    string Arguments
);

public record OllamaTool(
    string Type,
    OllamaFunctionDefinition Function
);

public record OllamaFunctionDefinition(
    string Name,
    string Description,
    object Parameters
);

public record OllamaResponse(
    string Model,
    OllamaMessage Message,
    bool Done
);
