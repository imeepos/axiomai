import { Command } from 'commander';
import { registry, instanceCachingFactory, DependencyContainer } from 'tsyringe';
import { ApplicationInit } from '../tokens';
import { resolveAll } from '@axiomai/utils';
import { COMMAND_TOKENS, getParams } from '../decorators';
import { Logger } from '../logger';

@registry([
  { token: Command, useFactory: instanceCachingFactory((d) => new Command()) },
  {
    token: ApplicationInit,
    useValue: async (d: DependencyContainer) => {
      const logger = d.resolve(Logger);
      const program = d.resolve(Command);
      program.name('ai').description(`ai`).version(`1.0`, '-v, --version', 'display version number');
      const commands = resolveAll(COMMAND_TOKENS);
      commands.map((command) => {
        // 根据command
        const params = getParams(command.target, command.propertyKey);
        // const names = params.map((p) => `[${p.name}]`).join(' ');
        program
          .command(command.options.name)
          .description(command.options.description)
          .action(async (...args) => {
            const instance = d.resolve(command.target);
            const method = Reflect.get(instance, command.propertyKey);
            await method.bind(instance)(...args);
          });
      });
      program.on('command:*', () => {
        logger.error(`错误: 未知命令 '${program.args.join(' ')}'`);
        logger.info('');
        program.help();
      });
      if (process.argv.length === 2) {
        program.help();
      }
      program.parse(process.argv);
    },
  },
])
export class CommandsModule {}

export * from './McpServerCommand';
