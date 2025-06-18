import { injectable } from 'tsyringe';
import { Command, Params } from '../decorators';
import { z } from 'zod';

@injectable()
export class McpServerCommand {
  @Command({
    name: `startMcpServer [type]`,
    description: `启动mcp server`,
  })
  async startMcpServerCommand(type: string) {
    console.log({ type });
  }
}
