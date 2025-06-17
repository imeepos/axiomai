import type { Client } from "@modelcontextprotocol/sdk/client/index.js";

export interface AiFunction {
  name: string;
  description: string;
  parameters: any;
}
export interface AiTool {
  type: "function";
  function: AiFunction;
}
export async function createMcpTools(client: Client): Promise<AiTool[]> {
  const tools = await client.listTools();
  return tools.tools.map((tool) => {
    return {
      type: "function",
      function: {
        name: tool.name,
        description: tool.description || ``,
        parameters: tool.inputSchema,
      },
    };
  });
}
