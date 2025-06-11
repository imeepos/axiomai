import { container, DependencyContainer, InjectionToken } from "tsyringe";

export const resolveAll = <T>(
  token: InjectionToken<T>,
  injector: DependencyContainer = container
): T[] => {
  try {
    return injector.resolveAll(token);
  } catch (e) {
    return [];
  }
};

export const tryResolve = <T>(
  token: InjectionToken<T>,
  injector: DependencyContainer = container
) => {
  try {
    return injector.resolve(token);
  } catch (e) {
    return null;
  }
};
