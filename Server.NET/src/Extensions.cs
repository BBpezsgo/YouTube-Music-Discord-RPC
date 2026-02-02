using System.Diagnostics.CodeAnalysis;
using System.Text.Json;

namespace DiscordRPCHost;

static class Extensions
{
    public static bool TryGetProperty(this JsonElement element, string propertyName, out string? value)
    {
        if (element.TryGetProperty(propertyName, out JsonElement _value))
        {
            if (_value.ValueKind == JsonValueKind.String)
            {
                value = _value.GetString() ?? string.Empty;
                return true;
            }

            if (_value.ValueKind == JsonValueKind.Null)
            {
                value = null;
                return true;
            }
        }
        
        value = null;
        return false;
    }

    public static bool TryGetProperty(this JsonElement element, string propertyName, out int value)
    {
        if (element.TryGetProperty(propertyName, out JsonElement _value)
            && _value.ValueKind == JsonValueKind.Number)
        {
            value = _value.GetInt32();
            return true;
        }

        value = default;
        return false;
    }

    public static bool TryGetProperty(this JsonElement element, string propertyName, out ulong value)
    {
        if (element.TryGetProperty(propertyName, out JsonElement _value)
            && _value.ValueKind == JsonValueKind.Number)
        {
            value = _value.GetUInt64();
            return true;
        }

        value = default;
        return false;
    }
}
