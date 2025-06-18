import { registry, instanceCachingFactory } from 'tsyringe';
import { createDataSource, DATASOURCE } from './orm';

@registry([
  { token: DATASOURCE, useFactory: instanceCachingFactory(createDataSource) }
])
export class CoreModule {}
