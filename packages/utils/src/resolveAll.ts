import { container, DependencyContainer, InjectionToken } from 'tsyringe';

export const resolveAll = <T>(token: InjectionToken<T>, injector: DependencyContainer = container): T[] => {
  try {
    return injector.resolveAll(token);
  } catch (e) {
    return [];
  }
};

export const tryResolve = <T>(token: InjectionToken<T>, injector: DependencyContainer = container) => {
  try {
    return injector.resolve(token);
  } catch (e) {
    return null;
  }
};

export const tryJsonParse = <T>(str: string): T => {
  try {
    if (typeof str === 'string') {
      return tryJsonParse(JSON.parse(str));
    }
    if (typeof str === 'object') {
      return str as T;
    }
    throw new Error(`JSON解析失败，不支持类型${typeof str}`);
  } catch (e) {
    throw e;
  }
};
