import { registry, instanceCachingFactory } from 'tsyringe';
import { createDataSource, DATASOURCE } from './orm';
import { WORKSPACE_ROOT } from './tokens';

@registry([
  { token: DATASOURCE, useFactory: instanceCachingFactory(createDataSource) },
  { token: WORKSPACE_ROOT, useValue: process.cwd() },
])
export class CoreModule {}
