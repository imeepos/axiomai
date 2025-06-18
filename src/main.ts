import 'reflect-metadata';
import { config } from 'dotenv';
config();

import { container, WORKSPACE_ROOT, SiliconflowChatCli } from '@axiomai/core';

container.register(WORKSPACE_ROOT, { useValue: process.cwd() });

async function main() {
  const chat = container.resolve(SiliconflowChatCli);
  await chat.start();
}

main().catch((e) => {
  console.error('Application failed:', {
    message: e.message,
    stack: e.stack,
    timestamp: new Date().toISOString(),
  });
  process.exit(1);
});
