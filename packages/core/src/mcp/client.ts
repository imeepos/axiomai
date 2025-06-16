import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

export async function createMcpClient() {
  const client = new Client({ name: `@axiomai/core`, version: `1.0.0` });
  const transport = new StdioClientTransport({
    command: `ts-node`,
    args: ["-r", "tsconfig-paths/register", "src/server.ts"],
  });
  await client.connect(transport);
  return client;
}
