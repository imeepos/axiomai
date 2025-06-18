import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { container } from 'tsyringe';
import { Env } from '../env';

export async function createMcpClient() {
  const client = new Client({ name: `@axiomai/core`, version: `1.0.0` });
  const env = container.resolve(Env);
  const transport = new SSEClientTransport(new URL(`http://${env.get('MCP_HOST')}:${env.get(`MCP_PORT`)}/sse`));
  await client.connect(transport);
  return client;
}
