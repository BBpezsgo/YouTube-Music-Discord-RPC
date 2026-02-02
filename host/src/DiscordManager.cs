using System.Diagnostics.CodeAnalysis;
using Logger;

namespace DiscordRPCHost;

public class DiscordManager : IDisposable
{
    readonly Dictionary<string, DiscordClient> Clients = [];

    public bool TryGet(string clientId, [NotNullWhen(true)] out DiscordClient? client) =>
        Clients.TryGetValue(clientId, out client) &&
        !client.DiscordRpcClient.IsDisposed &&
        client.DiscordRpcClient.IsInitialized;

    public DiscordClient Get(string applicationId)
    {
        if (!Clients.TryGetValue(applicationId, out DiscordClient? client))
        {
            Log.MinorAction($"Discord: Creating new client");
            client = new DiscordClient(applicationId);
            Clients.Add(applicationId, client);
        }

        if (client.DiscordRpcClient.IsDisposed)
        {
            Log.MinorAction($"Discord: Creating new client again");
            Clients[applicationId] = new DiscordClient(applicationId);
        }

        if (!client.DiscordRpcClient.IsInitialized)
        {
            Log.MinorAction($"Discord: Initializing client");
            client.DiscordRpcClient.Initialize();
        }

        return client;
    }

    public void Disconnect()
    {
        foreach (DiscordClient item in Clients.Values)
        {
            item.ClearPresence();
            item.Dispose();
        }

        Clients.Clear();
    }

    public void Dispose()
    {
        Disconnect();
    }
}
