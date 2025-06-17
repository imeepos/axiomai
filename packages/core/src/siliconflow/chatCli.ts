import * as readline from "readline";
import { injectable } from "tsyringe";
import { lastValueFrom } from "rxjs";
import { WORKSPACE_ROOT } from "../tokens";
import { tryResolve } from "@axiomai/utils";
import { SiliconflowChat } from "./chat";
import { readFileSync } from "fs";
import { join } from "path";

// 命令常量
const EXIT_CMD = "exit";
const CLEAR_CMD = "clear";
const SAVE_CMD = "save";

@injectable()
export class SiliconflowChatCli {
  constructor(private chat: SiliconflowChat) {}

  async start() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "杨明明> ",
    });
    // 系统提示模板
    const root = tryResolve(WORKSPACE_ROOT) || process.cwd();
    const SYSTEM_PROMPT_TEMPLATE = readFileSync(
      join(root, "prompts/system.md"),
      "utf-8"
    );

    const currentTime = new Date().toLocaleString("zh-CN");
    const systemPrompt = SYSTEM_PROMPT_TEMPLATE
      .replace("{{root}}", root)
      .replace("{{currentTime}}", currentTime);

    console.log(
      `开始聊天会话。输入“${EXIT_CMD}”结束会话，输入“${CLEAR_CMD}”清除对话记录，输入“${SAVE_CMD}”保存为Markdown。\n`
    );
    this.chat.addMessage("system", systemPrompt);

    rl.prompt();

    rl.on("line", async (input) => {
      const command = input.trim().toLowerCase();

      if (command === EXIT_CMD) {
        rl.close();
        return;
      }

      if (command === CLEAR_CMD) {
        this.handleClear(rl);
        return;
      }

      if (command.startsWith(SAVE_CMD)) {
        const filename =
          command.length > SAVE_CMD.length
            ? command.substring(SAVE_CMD.length).trim()
            : undefined;
        await this.handleSave(filename);
        rl.prompt();
        return;
      }

      await this.handleUserInput(rl, input);
    }).on("close", async () => {
      await this.handleSave();
      console.log("\n聊天会话已结束\n");
      process.exit(0);
    });
  }

  private handleClear(rl: readline.Interface) {
    this.chat.clearHistory();
    console.log("\n对话记录已清除。\n");
    rl.prompt();
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

  private async handleUserInput(rl: readline.Interface, input: string) {
    this.chat.addMessage("user", input);
    rl.pause();
    console.log("思考中...");

    try {
      await lastValueFrom(this.chat.chatContinue());
    } catch (error) {
      const err = error as Error;
      console.error("\n处理请求时出错:", err.message);
    } finally {
      rl.resume();
      rl.prompt();
    }
  }
}
