import { container, InjectionToken } from 'tsyringe';
import { Type } from '../../types';

export interface CommandOptions {
  name?: string;
  description?: string;
}
export interface CommandMetadata {
  target: Type<any>;
  propertyKey: string | symbol;
  descriptor: TypedPropertyDescriptor<any>;
  options: Required<CommandOptions>;
}
export const COMMAND_TOKENS: InjectionToken<CommandMetadata> = `COMMAND_TOKENS`;
export const Command = (options: CommandOptions = {}): MethodDecorator => {
  return (target, propertyKey, descriptor) => {
    const type = target.constructor as Type<any>;
    options.name = options.name || `${type.name}.${propertyKey.toString()}`;
    options.description = options.description || ``;
    container.register(COMMAND_TOKENS, {
      useValue: {
        target: type,
        propertyKey,
        descriptor,
        options,
      },
    });
  };
};
