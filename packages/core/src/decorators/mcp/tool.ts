import { container, injectable, InjectionToken } from "tsyringe";
import { Type } from "../../types";
import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type {
  ServerRequest,
  ServerNotification,
  CallToolResult,
} from "@modelcontextprotocol/sdk/types.js";
/**
 * tool
 */
export interface ToolOptions {
  name?: string;
  description?: string;
}

export interface ToolClassMetadata {
  target: Type<any>;
  options: ToolOptions;
}
export function isToolClassMetadata(val: any): val is ToolClassMetadata {
  return !isToolMethodMetadata(val) && !isToolPropertyMetadata(val);
}
export interface ToolPropertyMetadata {
  target: Type<any>;
  propertyKey: string | symbol;
  options: ToolOptions;
}
export function isToolPropertyMetadata(val: any): val is ToolPropertyMetadata {
  return !isToolMethodMetadata(val) && val && val.propertyKey;
}
export interface ToolMethodMetadata {
  target: Type<any>;
  propertyKey?: string | symbol;
  options: ToolOptions;
  descriptor: TypedPropertyDescriptor<any>;
}
export function isToolMethodMetadata(val: any): val is ToolMethodMetadata {
  return val && val.descriptor;
}
export type ToolMetadata =
  | ToolClassMetadata
  | ToolPropertyMetadata
  | ToolMethodMetadata;

export const TOOL_TOKENS: InjectionToken<ToolMetadata> =
  Symbol.for(`TOOL_TOKENS`);
export interface Tool {
  run: ToolCallback;
}
export class ITool implements Tool {
  run: (
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ) => CallToolResult | Promise<CallToolResult>;
}
export function ToolClass(options: ToolOptions = {}): ClassDecorator {
  return (target: any) => {
    const type = target as Type<any>;
    options.name = options.name || type.name;
    container.register(TOOL_TOKENS, {
      useValue: {
        target: type,
        options,
      },
    });
    injectable()(target);
  };
}
export function Tool(options: ToolOptions = {}): MethodDecorator {
  return (target: any, propertyKey, descriptor) => {
    const type = target.constructor as Type<any>;
    options.name = options.name || `${type.name}.${propertyKey.toString()}`;
    container.register(TOOL_TOKENS, {
      useValue: {
        target: type,
        propertyKey,
        options,
        descriptor,
      },
    });
  };
}
