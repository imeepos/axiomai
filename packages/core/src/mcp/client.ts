import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

export async function createMcpClient() {
  const client = new Client({ name: `@axiomai/core`, version: `1.0.0` });
  const transport = new SSEClientTransport(new URL(`http://localhost:8989/sse`));
  await client.connect(transport);
  return client;
}
