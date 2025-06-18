import chalk from 'chalk';
import { inject, injectable, InjectionToken } from 'tsyringe';
/**
 * 日志工具
 * 提供彩色和格式化的日志输出
 */
export interface LoggerOptions {
  silent?: boolean;
}
export const LoggerOptions: InjectionToken<LoggerOptions> = `LoggerOptions`;
@injectable()
export class Logger {
  private silent: boolean = false;
  constructor(@inject(LoggerOptions, { isOptional: true }) options: LoggerOptions = {}) {
    this.silent = options.silent || false;
  }

  /**
   * 信息日志
   */
  info(message: string, ...args: any[]) {
    if (this.silent) return;
    console.error(chalk.blue('ℹ'), message, ...args);
  }

  /**
   * 成功日志
   */
  success(message: string, ...args: any[]) {
    if (this.silent) return;
    console.error(chalk.green('✅'), message, ...args);
  }

  /**
   * 警告日志
   */
  warn(message: string, ...args: any[]) {
    if (this.silent) return;
    console.error(chalk.yellow('⚠️'), chalk.yellow(message), ...args);
  }

  /**
   * 错误日志
   */
  error(message: string, ...args: any[]) {
    if (this.silent) return;
    console.error(chalk.red('❌'), chalk.red(message), ...args);
  }

  /**
   * 调试日志
   */
  debug(message: string, ...args: any[]) {
    if (this.silent || !process.env.DEBUG) return;
    console.error(chalk.gray('🐛'), chalk.gray(message), ...args);
  }

  /**
   * 步骤日志（用于显示进度）
   */
  step(message: string, ...args: any[]) {
    if (this.silent) return;
    console.error(chalk.cyan('▶️'), message, ...args);
  }

  /**
   * 直接输出（不带前缀）
   */
  log(message: string, ...args: any[]) {
    if (this.silent) return;
    console.error(message, ...args);
  }

  /**
   * 空行
   */
  newLine() {
    if (this.silent) return;
    console.error('');
  }

  /**
   * 分隔线
   */
  separator(char = '=', length = 80) {
    if (this.silent) return;
    console.error(chalk.gray(char.repeat(length)));
  }
}
