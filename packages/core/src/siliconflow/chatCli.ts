import * as readline from 'readline';
import { inject, injectable } from 'tsyringe';
import { lastValueFrom } from 'rxjs';
import { WORKSPACE_ROOT } from '../tokens';
import { tryResolve } from '@axiomai/utils';
import { SiliconflowChat } from './chat';
import { readFileSync } from 'fs';
import { join } from 'path';

// 命令常量
const EXIT_CMD = 'exit';
const CLEAR_CMD = 'clear';
const SAVE_CMD = 'save';
const MULTI_LINE_CMD = '/multi';
const END_MULTI_CMD = '/end';

@injectable()
export class SiliconflowChatCli {
  private rl?: readline.Interface;
  private isMultilineMode: boolean = false;
  private multilineBuffer: string[] = [];

  constructor(@inject(SiliconflowChat) private chat: SiliconflowChat) {}

  async start() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '二明> ',
    });

    // 系统提示模板
    const root = tryResolve(WORKSPACE_ROOT) || process.cwd();
    const SYSTEM_PROMPT_TEMPLATE = readFileSync(join(root, 'prompts/system.md'), 'utf-8');

    const currentTime = new Date().toLocaleString('zh-CN');
    const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace('{{WORKSPACE_ROOT}}', root).replace('{{CURRENT_TIME}}', currentTime);

    console.log(
      `开始聊天会话。输入“${EXIT_CMD}”结束会话，输入“${CLEAR_CMD}”清除对话记录，输入“${SAVE_CMD}”保存为Markdown。\n`,
      `输入“${MULTI_LINE_CMD}”进入多行输入模式，输入“${END_MULTI_CMD}”结束多行输入。\n`,
    );
    this.chat.addMessage('system', systemPrompt);

    this.rl.prompt();

    this.rl
      .on('line', async (input) => {
        // 多行模式处理
        if (this.isMultilineMode) {
          if (input.trim() === END_MULTI_CMD) {
            this.isMultilineMode = false;
            const fullInput = this.multilineBuffer.join('\n');
            this.multilineBuffer = [];
            this.setPrompt('杨明明> ');
            await this.handleUserInput(fullInput);
          } else {
            this.multilineBuffer.push(input);
          }
          this.rl?.prompt();
          return;
        }

        const command = input.trim().toLowerCase();

        if (command === EXIT_CMD) {
          this.rl?.close();
          return;
        }

        if (command === CLEAR_CMD) {
          this.handleClear();
          return;
        }

        if (command.startsWith(SAVE_CMD)) {
          const filename = command.length > SAVE_CMD.length ? command.substring(SAVE_CMD.length).trim() : undefined;
          await this.handleSave(filename);
          this.rl?.prompt();
          return;
        }

        // 多行模式命令
        if (command === MULTI_LINE_CMD) {
          this.isMultilineMode = true;
          this.multilineBuffer = [];
          this.setPrompt('多行模式> ');
          console.log('进入多行输入模式。输入“/end”结束多行输入。');
          this.rl?.prompt();
          return;
        }

        // 普通单行输入
        await this.handleUserInput(input);
      })
      .on('close', async () => {
        await this.handleSave();
        console.log('\n聊天会话已结束\n');
        process.exit(0);
      });
  }

  private setPrompt(prompt: string) {
    if (this.rl) {
      this.rl.setPrompt(prompt);
    }
  }

  private handleClear() {
    this.chat.clearHistory();
    console.log('\n对话记录已清除。\n');
    this.rl?.prompt();
  }

  private async handleSave(filename?: string) {
    try {
      const savedPath = await this.chat.saveToMarkdown(filename);
      console.log(`\n聊天记录已保存至: ${savedPath}\n`);
    } catch (error) {
      const err = error as Error;
      console.error(`\n保存失败: ${err.message}\n`);
    }
  }

  private async handleUserInput(input: string) {
    this.chat.addMessage('user', input);

    if (!this.rl) return;

    this.rl.pause();
    console.log('思考中...');

    try {
      await lastValueFrom(this.chat.chatContinue());
    } catch (error) {
      const err = error as Error;
      console.error('\n处理请求时出错:', err.message);
    } finally {
      this.rl.resume();
      this.rl.prompt();
    }
  }
}
