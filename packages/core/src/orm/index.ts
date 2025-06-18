import { resolveAll } from '@axiomai/utils';
import { container, DependencyContainer, InjectionToken } from 'tsyringe';
import { DataSource, EntityManager } from 'typeorm';
import { ENTITY_TOKENS } from '../decorators';
import { join } from 'path';
import { WORKSPACE_ROOT } from '../tokens';
import { ensureDir } from 'fs-extra';
export const DATASOURCE: InjectionToken<Promise<DataSource>> = `DATASOURCE`;
export async function createDataSource(container: DependencyContainer) {
  const root = container.resolve(WORKSPACE_ROOT);
  const entities = resolveAll(ENTITY_TOKENS, container);
  await ensureDir(join(root, `data`));
  const ds = new DataSource({
    type: 'sqljs',
    location: join(root, 'data/sql.db'),
    useLocalForage: true,
    autoSave: true,
    sqlJsConfig: {},
    entities: entities,
    synchronize: true,
  });
  await ds.initialize();
  return ds;
}
export interface UseDataSource<T> {
  (ds: DataSource): Promise<T>;
}
export async function useDataSource<T>(cb: UseDataSource<T>, injector: DependencyContainer = container) {
  const ds = await injector.resolve(DATASOURCE);
  if (ds.isInitialized) {
    return await cb(ds);
  }
  await ds.initialize();
  return await cb(ds);
}

export interface UseEntityManager<T> {
  (ds: EntityManager): Promise<T>;
}
export async function useEntityManager<T>(cb: UseEntityManager<T>, injector: DependencyContainer = container) {
  return useDataSource((ds) => {
    const m = ds.createEntityManager();
    return cb(m);
  }, injector);
}
