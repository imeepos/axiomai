import { registry, instanceCachingFactory } from 'tsyringe';
import { createDataSource, DATASOURCE } from './orm';
import { WORKSPACE_ROOT } from './tokens';
import { LoggerOptions } from './logger';

@registry([
  { token: DATASOURCE, useFactory: instanceCachingFactory(createDataSource) },
  { token: WORKSPACE_ROOT, useValue: process.cwd() },
  { token: LoggerOptions, useValue: { silent: true } },
])
export class CoreModule {}
