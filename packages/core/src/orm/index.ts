import { resolveAll } from '@axiomai/utils';
import { DependencyContainer } from 'tsyringe';
import { DataSource } from 'typeorm';
import { ENTITY_TOKENS } from '../decorators';

export async function createDataSource(container: DependencyContainer) {
  const entities = resolveAll(ENTITY_TOKENS, container);
  const ds = new DataSource({
    type: `sqlite`,
    database: `axiomai`,
    entities: entities,
    synchronize: true,
    name: `default`,
  });

  await ds.initialize();

  return ds;
}
