import { container, InjectionToken } from "tsyringe";
import { Type } from "../../types";
import { object, ZodRawShape, ZodTypeAny } from "zod";
import { resolveAll } from "@axiomai/utils";

/**
 * params
 */
export interface ParamsMetadata {
  target: Type<any>;
  propertyKey: string | symbol;
  paramterIndex: number;
  zod: ZodTypeAny;
}
export const PARAMS_TOKENS: InjectionToken<ParamsMetadata> =
  Symbol.for(`PARAMS_TOKENS`);
export const Params = (zod: ZodTypeAny): ParameterDecorator => {
  return (target, propertyKey, paramterIndex) => {
    container.register(PARAMS_TOKENS, {
      useValue: { target: target.constructor, propertyKey, paramterIndex, zod },
    });
  };
};

export function getParams(target: any, propertyKey: string | symbol) {
  const params = resolveAll<ParamsMetadata>(PARAMS_TOKENS);
  return params.filter(
    (p) => p.target === target && p.propertyKey === propertyKey
  );
}

export function getParamsZod(
  target: any,
  propertyKey: string | symbol = "run"
) {
  const params = getParams(target, propertyKey);
  const obj: ZodRawShape = {};
  params.map((p) => {
    Reflect.set(obj, p.propertyKey, p.zod);
  });
  return obj;
}
