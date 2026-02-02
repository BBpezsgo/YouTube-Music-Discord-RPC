using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Text.RegularExpressions;
using Logger;

namespace DiscordRPCHost;

sealed partial class WebSocketServer : IDisposable
{
    readonly TcpListener Server;

    public WebSocketServer()
    {
        const string ip = "127.0.0.1";
        const int port = 6969;

        Server = new(IPAddress.Parse(ip), port);
        Server.Start();
        Log.Info($"Server has started on {ip}:{port}");
    }

    public async Task<WebSocketClient> AcceptAsync(CancellationToken cancellationToken)
    {
        Log.MinorAction("Waiting for a client");
        TcpClient client = await Server.AcceptTcpClientAsync(cancellationToken);
        Log.Info($"Client {client.Client.RemoteEndPoint} connected");

        NetworkStream stream = client.GetStream();
        byte[]? bytes = null;

        while (!cancellationToken.IsCancellationRequested)
        {
            Thread.Sleep(100);

            while (!stream.DataAvailable && !cancellationToken.IsCancellationRequested)
            {
                Thread.Sleep(100);
            }

            while (client.Available < 3 && !cancellationToken.IsCancellationRequested)
            {
                Thread.Sleep(100);
            }

            if (cancellationToken.IsCancellationRequested) break;

            if (bytes is null || bytes.Length < client.Available)
            {
                bytes = new byte[client.Available];
            }

            await stream.ReadExactlyAsync(bytes, cancellationToken);
            string s = Encoding.UTF8.GetString(bytes);

            if (!s.StartsWith("GET", StringComparison.Ordinal))
            {
                Log.Warning("Invalid handshake, closing connection");

                stream.Dispose();
                client.Dispose();
                continue;
            }

            Log.MinorAction("Handshaking client");
            Handshake(stream, s);
            return new WebSocketClient(client);
        }

        return default;
    }

    [System.Diagnostics.CodeAnalysis.SuppressMessage("Security", "CA5350:Do Not Use Weak Cryptographic Algorithms", Justification = "<Pending>")]
    static void Handshake(NetworkStream stream, string s)
    {
        // 1. Obtain the value of the "Sec-WebSocket-Key" request header without any leading or trailing whitespace
        // 2. Concatenate it with "258EAFA5-E914-47DA-95CA-C5AB0DC85B11" (a special GUID specified by RFC 6455)
        // 3. Compute SHA-1 and Base64 hash of the new value
        // 4. Write the hash back as the value of "Sec-WebSocket-Accept" response header in an HTTP response
        string swk = SecWebSocketKeyRegex().Match(s).Groups[1].Value.Trim();
        string swkAndSalt = swk + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
        byte[] swkAndSaltSha1 = System.Security.Cryptography.SHA1.HashData(Encoding.UTF8.GetBytes(swkAndSalt));
        string swkAndSaltSha1Base64 = Convert.ToBase64String(swkAndSaltSha1);

        // HTTP/1.1 defines the sequence CR LF as the end-of-line marker
        stream.Write(Encoding.UTF8.GetBytes(
            "HTTP/1.1 101 Switching Protocols\r\n" +
            "Connection: Upgrade\r\n" +
            "Upgrade: websocket\r\n" +
            "Sec-WebSocket-Accept: " + swkAndSaltSha1Base64 + "\r\n\r\n"));
    }

    [GeneratedRegex("Sec-WebSocket-Key: (.*)")]
    private static partial Regex SecWebSocketKeyRegex();

    public void Dispose()
    {
        Log.MinorAction("Closing server");
        Server.Dispose();
    }
}
