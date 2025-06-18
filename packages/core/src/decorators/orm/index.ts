import { container, InjectionToken } from 'tsyringe';
import { EntityOptions, Entity as OrmEntity } from 'typeorm';
import { Type } from '../../types';
export const ENTITY_TOKENS: InjectionToken<Type<any>> = `ENTITY_TOKENS`;
export const Entity = (options?: EntityOptions): ClassDecorator => {
  return (target) => {
    container.register(ENTITY_TOKENS, { useValue: target });
    OrmEntity(options)(target);
  };
};
