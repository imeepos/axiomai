import { resolveAll } from '@axiomai/utils';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  getParams,
  getParamsZod,
  isToolMethodMetadata,
  isToolPropertyMetadata,
  TOOL_TOKENS,
  ToolMetadata,
} from '../decorators';
import { DependencyContainer } from 'tsyringe';
import { McpOutputService } from './output';

export async function createMcpServer(container: DependencyContainer) {
  const server = new McpServer({
    name: `@axiomai/core`,
    version: `1.0.0`,
  });
  // tools
  const tools = resolveAll<ToolMetadata>(TOOL_TOKENS, container);
  tools.map((tool) => {
    let name = tool.options.name;
    let description = tool.options.description;
    if (isToolPropertyMetadata(tool)) {
    } else if (isToolMethodMetadata(tool)) {
      const params = getParams(tool.target, tool.propertyKey);
      const zod = getParamsZod(params);
      server.tool(name || ``, description || ``, zod, async (args: any, extra) => {
        const output = container.resolve(McpOutputService);
        try {
          const _arguments = params
            .sort((a, b) => a.paramterIndex - b.paramterIndex)
            .map((p) => Reflect.get(args, p.name));
          const instance = container.resolve(tool.target);
          const method = Reflect.get(instance, tool.propertyKey || `run`);
          const result = await method.bind(instance)(..._arguments);
          return output.createSuccessResponse(result);
        } catch (e) {
          return output.createErrorResponse(e);
        }
      });
    } else {
    }
  });
  return server;
}
