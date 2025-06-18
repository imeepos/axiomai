import { container, DependencyContainer, InjectionToken } from 'tsyringe';
import { Type } from './types';
import { resolveAll } from '@axiomai/utils';

export const ApplicationInit: InjectionToken<(d: DependencyContainer) => Promise<void>> = `ApplicationInit`;

export const WORKSPACE_ROOT: InjectionToken<string> = `WORKSPACE_ROOT`;

export const CORE_MODULES: InjectionToken<Type<any>> = `CORE_MODULES`;

export async function bootstrap(modules: any[] = []) {
  const inits = resolveAll(ApplicationInit);
  await Promise.all(inits.map((init) => init(container)));
}
