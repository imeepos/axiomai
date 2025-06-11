import {
  container,
  DependencyContainer,
  injectable,
  InjectionToken,
} from "tsyringe";
import { Type } from "./types";
import { resolveAll, tryJsonParse } from "@axiomai/utils";
export interface ToolMetadata<T = any> {
  target: Type<T>;
  options: Required<ToolOptions>;
}
export const TOOL_TOKEN: InjectionToken<ToolMetadata> = `TOOL_TOKEN`;
export interface Tool<T = any> {
  run(): Promise<T>;
}
export function isTool(val: any): val is Tool {
  return val && typeof val.run === "function";
}
export interface ToolOptions {
  name?: string;
  description: string;
}
export const Tool = (options: ToolOptions): ClassDecorator => {
  return (target) => {
    options.name = options.name || target.name;
    container.register(TOOL_TOKEN, { useValue: { target, options } });
    const type = target as any as Type<any>;
    injectable()(type);
  };
};
export interface InputTypeFactory {
  (injector: DependencyContainer): any;
}
export interface InputMetadata<T = any> {
  target: Type<T>;
  propertyKey: string | symbol;
  options: InputOptions;
}
export const INPUT_TOKEN: InjectionToken<InputMetadata> = `INPUT_TOKEN`;
export interface InputOptions {
  description?: string;
  typeFactory?: InputTypeFactory | string;
}
export const Input = (options: InputOptions = {}): PropertyDecorator => {
  return (taregt, propertyKey) => {
    options.description = options.description || ``;
    options.typeFactory = options.typeFactory || `string`;
    container.register(INPUT_TOKEN, {
      useValue: {
        target: taregt.constructor,
        propertyKey,
        options: options,
      },
    });
  };
};

export function createTools() {
  const tools = resolveAll(TOOL_TOKEN);
  return tools.map((tool) => toolMetadataToAiTool(tool));
}

export function getAllToolsDescription() {
  const tools = resolveAll(TOOL_TOKEN);
  return "[" + tools.map((tool) => tool.options.name).join(",") + "]";
}

export interface AiFunctionParameters {
  type?: string;
  description?: string;
  properties?: { [key: string]: AiFunctionParameters };
}
export interface AiFunction {
  name: string;
  description: string;
  parameters: AiFunctionParameters;
}
export interface AiTool {
  type: "function";
  function: AiFunction;
}
export function toolMetadataToAiTool(tool: ToolMetadata): AiTool {
  const allInputs = resolveAll(INPUT_TOKEN);
  const inputs = allInputs.filter((it) => it.target === tool.target);
  const properties: { [key: string]: AiFunctionParameters } = {};
  inputs.map((input) => {
    const factory = input.options.typeFactory;
    if (factory && typeof factory === "function") {
      const type = factory(container);
      properties[input.propertyKey as string] = {
        type: type.toString(),
        description: input.options.description,
      };
    } else {
      properties[input.propertyKey as string] = {
        type: factory || `string`,
        description: input.options.description,
      };
    }
  });
  const parameters: AiFunctionParameters = {
    type: "object",
    properties: properties,
  };
  return {
    type: "function",
    function: {
      name: tool.options.name,
      description: tool.options.description,
      parameters: parameters,
    },
  };
}

export interface FunctionCall {
  index: number;
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}
export async function runFunctionTool(fun: FunctionCall) {
  console.log(
    `调用工具:${fun.function.name} 参数：${typeof fun.function.arguments}`,
    fun.function
  );
  const tools = resolveAll(TOOL_TOKEN);
  const tool = tools.find((tool) => tool.options.name === fun.function.name);
  if (tool) {
    const instance = container.resolve(tool.target);
    const allInputs = resolveAll(INPUT_TOKEN);
    const inputs = allInputs.filter((it) => it.target === tool.target);
    const args = tryJsonParse(fun.function.arguments);
    if (args) {
      inputs.map((input) => {
        const val = Reflect.get(args, input.propertyKey);
        Reflect.set(instance, input.propertyKey, val);
      });
    }
    if (isTool(instance)) {
      const content = await instance.run();
      return {
        id: fun.id,
        content: content,
        role: `tool_call`,
      };
    }
  }
}
