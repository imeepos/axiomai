import { resolveAll } from "@axiomai/utils";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  getParamsZod,
  isToolMethodMetadata,
  isToolPropertyMetadata,
  TOOL_TOKENS,
  ToolMetadata,
} from "../decorators";
import { DependencyContainer } from "tsyringe";

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
      server.tool(
        name || ``,
        description || ``,
        getParamsZod(tool.target, tool.propertyKey),
        (...args: any[]) => {
          const instance = container.resolve(tool.target);
          const method = Reflect.get(instance, tool.propertyKey || `run`);
          return method.bind(instance)(...args);
        }
      );
    } else {
    }
  });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  return server;
}
