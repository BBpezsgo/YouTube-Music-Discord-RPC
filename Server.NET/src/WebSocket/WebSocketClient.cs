using System.Diagnostics;
using System.Net.Sockets;
using System.Text;
using Logger;

namespace DiscordRPCHost;

public struct WebSocketClient(TcpClient client) : IDisposable
{
    public readonly bool Connected => client.Connected;
    public readonly TcpClient TcpClient => client;
    DateTimeOffset SentTime = DateTimeOffset.UtcNow;
    DateTimeOffset ReceivedTime = DateTimeOffset.UtcNow;

    public readonly void Dispose()
    {
        if (client.Connected)
        {
            Log.Warning($"Closing connection with client {client.Client.RemoteEndPoint}");
        }

        client.Dispose();
    }

    public WebSocketMessage Receive(CancellationToken cancellationToken)
    {
        byte[]? bytes = null;

        while (!cancellationToken.IsCancellationRequested)
        {
            Thread.Sleep(100);

            if (!client.Connected)
            {
                Log.Warning("Connection unexpectedly closed by client");
                throw new Exception($"Connection closed");
            }

            //if ((DateTimeOffset.UtcNow - ReceivedTime).TotalSeconds > 5 &&
            //    (DateTimeOffset.UtcNow - SentTime).TotalSeconds > 5)
            //{
            //    Log.MinorAction("Sending ping");
            //    Send(new WebSocketFrame()
            //    {
            //        Opcode = WebSocketOpcode.Ping,
            //    });
            //}

            //if ((DateTimeOffset.UtcNow - ReceivedTime).TotalSeconds > 12)
            //{
            //    Dispose();
            //    Log.Warning("Client did not respond, disconnecting");
            //    throw new Exception($"Connection closed");
            //}

            NetworkStream stream = TcpClient.GetStream();

            if (!stream.DataAvailable) continue;

            if (bytes is null || bytes.Length < client.Available)
            {
                bytes = new byte[client.Available];
            }

            stream.ReadExactly(bytes);

            WebSocketFrame frame = WebSocketFrame.Decode(bytes);
            ReceivedTime = DateTimeOffset.UtcNow;

            switch (frame.Opcode)
            {
                case WebSocketOpcode.ContinuationFrame:
                    throw new NotImplementedException();
                case WebSocketOpcode.TextFrame:
                    return new WebSocketMessage(false, frame.Payload, Encoding.UTF8.GetString(frame.Payload));
                case WebSocketOpcode.BinaryFrame:
                    return new WebSocketMessage(true, frame.Payload, null);
                case WebSocketOpcode.ConnectionClose:
                    Dispose();
                    Log.Warning("Connection closed by client");
                    throw new Exception($"Connection closed");
                case WebSocketOpcode.Ping:
                    Send(new WebSocketFrame()
                    {
                        Opcode = WebSocketOpcode.Pong,
                    });
                    Log.None("Incoming ping");
                    break;
                case WebSocketOpcode.Pong:
                    Log.None("Incoming pong");
                    break;
                default:
                    throw new UnreachableException();
            }
        }

        return default;
    }

    public void Send(string message) => Send(new WebSocketFrame()
    {
        Opcode = WebSocketOpcode.TextFrame,
        Payload = Encoding.UTF8.GetBytes(message),
    });

    public void Send(byte[] message) => Send(new WebSocketFrame()
    {
        Opcode = WebSocketOpcode.BinaryFrame,
        Payload = message,
    });

    public void Send(WebSocketFrame frame)
    {
        NetworkStream stream = TcpClient.GetStream();
        stream.Write(WebSocketFrame.Encode(frame));
        stream.Flush();
        SentTime = DateTimeOffset.UtcNow;
    }
}
