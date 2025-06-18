import 'reflect-metadata';
import { config } from 'dotenv';
config();

import { container, WORKSPACE_ROOT, SiliconflowChatCli, useEntityManager, CoreModule, bootstrap, CommandsModule } from '@axiomai/core';
import { CogniArchiveCategory } from '@axiomai/core/src/entities/CogniArchive/CogniArchiveCategory';

container.register(WORKSPACE_ROOT, { useValue: process.cwd() });

async function main() {
  await bootstrap([CoreModule, CommandsModule]);
  await useEntityManager(async (m) => {
    const categories = await m.find(CogniArchiveCategory);
    console.log({ categories });
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
