namespace DiscordRPCHost;

public readonly struct WebSocketFrame
{
    public bool Fin { get; init; }
    public WebSocketOpcode Opcode { get; init; }
    public byte[] Payload { get; init; }

    public static WebSocketFrame Decode(byte[] bytes)
    {
        bool fin = (bytes[0] & 0b_1000_0000) != 0;
        WebSocketOpcode opcode = (WebSocketOpcode)(bytes[0] & 0b_0000_1111);
        bool mask = (bytes[1] & 0b_1000_0000) != 0;
        ulong offset = 2;
        ulong msgLen = bytes[1] & (ulong)0b_0111_1111;

        if (msgLen == 126)
        {
            msgLen = BitConverter.ToUInt16([bytes[3], bytes[2]], 0);
            offset = 4;
        }
        else if (msgLen == 127)
        {
            msgLen = BitConverter.ToUInt64([bytes[9], bytes[8], bytes[7], bytes[6], bytes[5], bytes[4], bytes[3], bytes[2]], 0);
            offset = 10;
        }

        if (msgLen == 0)
        {
            return new WebSocketFrame()
            {
                Fin = fin,
                Opcode = opcode,
                Payload = [],
            };
        }
        else if (mask)
        {
            byte[] decoded = new byte[msgLen];
            byte[] masks = [bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]];
            offset += 4;

            for (ulong i = 0; i < msgLen; i++)
            {
                decoded[i] = (byte)(bytes[offset + i] ^ masks[i % 4]);
            }

            return new WebSocketFrame()
            {
                Fin = fin,
                Opcode = opcode,
                Payload = decoded,
            };
        }
        else
        {
            byte[] decoded = new byte[msgLen];
            Array.Copy(bytes, (int)offset, decoded, 0, (int)msgLen);

            return new WebSocketFrame()
            {
                Fin = fin,
                Opcode = opcode,
                Payload = decoded,
            };
        }
    }

    public static byte[] Encode(WebSocketFrame frame)
    {
        List<byte> result = [];

        result.Add((byte)(0
            | (frame.Fin ? 0b_1000_0000 : 0)
            | ((int)frame.Opcode & 0b_0000_1111)
        ));

        const bool mask = false;

        result.Add((byte)(0
            | (mask ? 0b_1000_0000 : 0)
        ));

        if (frame.Payload is not null)
        {
            if (frame.Payload.Length < 126)
            {
                result[^1] |= (byte)frame.Payload.Length;
            }
            else
            {
                result[^1] |= 126;
                byte[] bytes = BitConverter.GetBytes((uint)frame.Payload.Length);
                result.Add(bytes[1]);
                result.Add(bytes[0]);
            }

            result.AddRange(frame.Payload);
        }

        return [.. result];
    }
}
