using System.Text.Json;
using Logger;

namespace DiscordRPCHost;

static class Program
{
    static void Main()
    {
        CancellationTokenSource cancellationTokenSource = new();
        Console.CancelKeyPress += (sender, e) =>
        {
            e.Cancel = true;
            cancellationTokenSource.Cancel();
            Log.MajorAction("Closing");
        };

        try
        {
            Run(cancellationTokenSource.Token).Wait();
        }
        catch (AggregateException ex)
        {
            if (ex.InnerExceptions.Count == 1 && ex.InnerExceptions[0] is TaskCanceledException) return;
            throw;
        }
    }

    static async Task Run(CancellationToken cancellationToken)
    {
        using DiscordManager discordManager = new();
        using WebSocketServer wsServer = new();

        List<Thread> threads = [];

        while (!cancellationToken.IsCancellationRequested)
        {
            Thread.Sleep(100);

            WebSocketClient client = await wsServer.AcceptAsync(cancellationToken);
            Thread thread = new(SocketThread)
            {
                IsBackground = true,
            };
            threads.Add(thread);
            thread.Start(new SocketThreadParams()
            {
                Client = client,
                DiscordManager = discordManager,
                CancellationToken = cancellationToken,
            });
        }

        foreach (Thread item in threads)
        {
            if (item.IsAlive) item.Join();
        }
    }

    struct SocketThreadParams
    {
        public required WebSocketClient Client;
        public required DiscordManager DiscordManager;
        public required CancellationToken CancellationToken;
    }

    static void SocketThread(object? _v)
    {
        SocketThreadParams v = (SocketThreadParams)_v!;
        WebSocketClient client = v.Client;
        DiscordManager discordManager = v.DiscordManager;
        CancellationToken cancellationToken = v.CancellationToken;

        client.Send("{\"version\":\"0.3.0\"}");

        HashSet<string> clientIds = [];

        while (client.Connected && !cancellationToken.IsCancellationRequested)
        {
            Thread.Sleep(100);

            try
            {
                Log.MinorAction("Waiting for message");
                WebSocketMessage message = client.Receive(cancellationToken);

                if (cancellationToken.IsCancellationRequested) break;

                if (message.IsBinary)
                {
                    Log.Warning("Unexpected binary data");
                    continue;
                }

                Console.WriteLine(message.Text);

                JsonDocument docs = JsonDocument.Parse(message.Text, new JsonDocumentOptions()
                {
                    AllowTrailingCommas = true,
                    CommentHandling = JsonCommentHandling.Skip,
                });

                if (docs.RootElement.TryGetProperty("action", out JsonElement actionProperty))
                {
                    switch (actionProperty.GetString())
                    {
                        case "disconnect":
                            discordManager.Disconnect();
                            break;
                        case "party":
                            foreach (JsonElement el in docs.RootElement.GetProperty("listener").EnumerateArray())
                            {
                                string clientId = docs.RootElement.GetProperty("clientId").GetString()!;
                                discordManager.Get(clientId);
                                clientIds.Add(clientId);
                            }
                            break;
                        case "reply":
                            throw new NotImplementedException();
                    }
                }
                else if (docs.RootElement.TryGetProperty("presence", out JsonElement presence))
                {
                    string clientId = docs.RootElement.GetProperty("clientId").GetString()!;
                    discordManager.Get(clientId).UpdatePresence(presence);
                    clientIds.Add(clientId);
                }
            }
            catch (Exception e)
            {
                Log.Error(e);
                continue;
            }
        }

        foreach (string clientId in clientIds)
        {
            if (discordManager.TryGet(clientId, out DiscordClient? discordClient))
            {
                discordClient.ClearPresence();
            }
        }

        discordManager.Dispose();
        client.Dispose();
    }
}
