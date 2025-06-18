import 'reflect-metadata';
import { config } from 'dotenv';
config();

import { container, createMcpServer, bootstrap, CoreModule, Env } from '@axiomai/core';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';

async function main() {
  await bootstrap([CoreModule]);
  const app = express();
  app.use(express.json());
  const server = await createMcpServer(container);
  const transports = {
    streamable: {} as Record<string, StreamableHTTPServerTransport>,
    sse: {} as Record<string, SSEServerTransport>,
  };
  app.use((req, res, next) => {
    console.log(`path: ${req.method}:${req.path}`, req.body);
    next();
  });
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
    });
  });
  app.get('/sse', async (req, res) => {
    const transport = new SSEServerTransport('/messages', res);
    transports.sse[transport.sessionId] = transport;
    res.on('close', () => {
      delete transports.sse[transport.sessionId];
    });
    await server.connect(transport);
  });

  app.post('/messages', async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports.sse[sessionId];
    if (transport) {
      await transport.handlePostMessage(req, res, req.body);
    } else {
      res.status(400).send('No transport found for sessionId');
    }
  });
  const env = container.resolve(Env);
  const port = parseInt(env.get(`MCP_PORT`) || `8989`);
  const host = env.get(`MCP_HOST`) || `localhost`;
  app.listen(port, '0.0.0.0', () => {
    console.log(`http://${host}:8989`);
  });
}

main().catch((e) => {
  console.error('Application failed:', {
    message: e.message,
    stack: e.stack,
    timestamp: new Date().toISOString(),
  });
  process.exit(1);
});
