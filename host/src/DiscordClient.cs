using System.Text.Json;
using DiscordRPC;
using Logger;

namespace DiscordRPCHost;

public sealed class DiscordClient : IDisposable
{
    public DiscordRpcClient DiscordRpcClient { get; }
    bool IsReady;
    RichPresence? AwaitingActivity;

    public DiscordClient(string applicationId)
    {
        Log.MinorAction($"Discord: Connecting");
        DiscordRpcClient = new DiscordRpcClient(applicationId);

        DiscordRpcClient.OnError += (sender, ev) =>
        {
            Log.Error($"Discord [{DiscordRpcClient.ApplicationID}]: {ev.Message}");
        };

        DiscordRpcClient.OnClose += (sender, ev) =>
        {
            Log.Warning($"Discord [{DiscordRpcClient.ApplicationID}]: Disconnected ({ev.Reason})");
        };

        DiscordRpcClient.OnReady += (sender, ev) =>
        {
            IsReady = true;

            Log.Info($"Discord [{DiscordRpcClient.ApplicationID}]: Ready");

            //DiscordRpcClient.Subscribe(EventType.Join);
            //DiscordRpcClient.Subscribe(EventType.Spectate);
            //DiscordRpcClient.Subscribe(EventType.JoinRequest);

            if (AwaitingActivity is not null)
            {
                UpdatePresence(AwaitingActivity);
                AwaitingActivity = null;
            }
        };

        DiscordRpcClient.OnSpectate += (sender, ev) =>
        {

        };

        DiscordRpcClient.OnJoinRequested += (sender, ev) =>
        {

        };

    }

    public void UpdatePresence(RichPresence presence)
    {
        if (IsReady)
        {
            Log.MinorAction($"Discord [{DiscordRpcClient.ApplicationID}]: Setting presence");
            DiscordRpcClient.SetPresence(presence);
        }
        else
        {
            AwaitingActivity = presence;
        }
    }

    public void UpdatePresence(JsonElement presence)
    {
        if (presence.ValueKind == JsonValueKind.Null || presence.ValueKind == JsonValueKind.Undefined)
        {
            ClearPresence();
            return;
        }

        RichPresence richPresence = new();

        if (presence.TryGetProperty("type", out int type))
        {
            richPresence.Type = (ActivityType)type;
        }

        if (presence.TryGetProperty("details", out string? details))
        {
            richPresence.Details = details;
        }

        if (presence.TryGetProperty("detailsUrl", out string? detailsUrl))
        {
            richPresence.DetailsUrl = detailsUrl;
        }

        if (presence.TryGetProperty("state", out string? state))
        {
            richPresence.State = state;
        }

        if (presence.TryGetProperty("stateUrl", out string? stateUrl))
        {
            richPresence.StateUrl = stateUrl;
        }

        if (presence.TryGetProperty("statusDisplay", out int statusDisplay))
        {
            richPresence.StatusDisplay = (StatusDisplayType)statusDisplay;
        }

        if (presence.TryGetProperty("assets", out JsonElement assets) && assets.ValueKind == JsonValueKind.Object)
        {
            richPresence.Assets ??= new();

            if (assets.TryGetProperty("largeImageKey", out string? largeImageKey))
            {
                richPresence.Assets.LargeImageKey = largeImageKey;
            }

            if (assets.TryGetProperty("largeImageText", out string? largeImageText))
            {
                richPresence.Assets.LargeImageText = largeImageText;
            }

            if (assets.TryGetProperty("largeImageUrl", out string? largeImageUrl))
            {
                richPresence.Assets.LargeImageUrl = largeImageUrl;
            }

            if (assets.TryGetProperty("smallImageKey", out string? smallImageKey))
            {
                richPresence.Assets.SmallImageKey = smallImageKey;
            }

            if (assets.TryGetProperty("smallImageText", out string? smallImageText))
            {
                richPresence.Assets.SmallImageText = smallImageText;
            }

            if (assets.TryGetProperty("smallImageUrl", out string? smallImageUrl))
            {
                richPresence.Assets.SmallImageUrl = smallImageUrl;
            }
        }

        if (presence.TryGetProperty("timestamps", out JsonElement timestamps) && timestamps.ValueKind == JsonValueKind.Object)
        {
            richPresence.Timestamps ??= new();

            if (timestamps.TryGetProperty("start", out ulong startTimestamp))
            {
                richPresence.Timestamps.StartUnixMilliseconds = startTimestamp;
            }

            if (timestamps.TryGetProperty("end", out ulong endTimestamp))
            {
                richPresence.Timestamps.EndUnixMilliseconds = endTimestamp;
            }
        }

        if (presence.TryGetProperty("buttons", out JsonElement buttons) && buttons.ValueKind == JsonValueKind.Array)
        {
            List<Button> _buttons = [];
            foreach (JsonElement button in buttons.EnumerateArray())
            {
                Button _button = new();

                if (button.TryGetProperty("label", out string? buttonLabel))
                {
                    _button.Label = buttonLabel;
                }

                if (button.TryGetProperty("url", out string? buttonUrl))
                {
                    _button.Url = buttonUrl;
                }

                _buttons.Add(_button);
            }
            richPresence.Buttons = [.. _buttons];
        }

        UpdatePresence(richPresence);
    }

    public void ClearPresence()
    {
        if (IsReady)
        {
            Log.MinorAction($"Discord [{DiscordRpcClient.ApplicationID}]: Clearing presence");
            DiscordRpcClient.ClearPresence();
        }
        else
        {
            AwaitingActivity = null;
        }
    }

    public void Dispose()
    {
        Log.MinorAction($"Discord [{DiscordRpcClient.ApplicationID}]: Closing");
        DiscordRpcClient.Dispose();
    }
}
