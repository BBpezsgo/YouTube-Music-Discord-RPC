using System.Diagnostics.CodeAnalysis;

namespace DiscordRPCHost;

public readonly struct WebSocketMessage(bool isBinary, byte[] data, string? text)
{
    [MemberNotNullWhen(false, nameof(Text))]
    public bool IsBinary { get; } = isBinary;
    public byte[] Data { get; } = data;
    public string? Text { get; } = text;
}
