import * as readline from "readline";
import { injectable } from "tsyringe";
import { lastValueFrom } from "rxjs";
import { WORKSPACE_ROOT } from "../tokens";
import { tryResolve } from "@axiomai/utils";
import { SiliconflowChat } from "./chat";
@injectable()
export class SiliconflowChatCli {
  constructor(private chat: SiliconflowChat) {}
  async start() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "杨明明> ",
    });

    console.log(
      "开始聊天会话。输入“exit”结束会话，输入“clear”清除对话记录，输入“save”保存为Markdown。"
    );
    const root = tryResolve(WORKSPACE_ROOT) || process.cwd();

    this.chat.addMessage(
      "system",
      "你是杨明明的私人的AI助手，并用中文回答用户问题"
    );
    this.chat.addMessage("system", `WORKSPACE_ROOT: ${root}`);
    rl.prompt();

    rl.on("line", async (input) => {
      if (input.toLowerCase() === "exit") {
        rl.close();
        return;
      }

      if (input.toLowerCase() === "clear") {
        this.chat.clearHistory();
        console.log("对话记录已清除。\n");
        rl.prompt();
        return;
      }

      // 新增：保存命令处理
      if (input.toLowerCase().startsWith("save")) {
        const filename = input.split(" ")[1] || undefined;
        try {
          const savedPath = await this.chat.saveToMarkdown(filename);
          console.log(`\n聊天记录已保存至: ${savedPath}\n`);
        } catch (error) {
          console.error(`\n保存失败: ${(error as Error).message}\n`);
        }
        rl.prompt();
        return;
      }

      this.chat.addMessage("user", input);
      rl.pause();
      try {
        // 使用await确保异步操作完成
        await lastValueFrom(this.chat.chatContinue());
      } catch (error) {
        console.error("\n处理请求时出错:", error);
      } finally {
        // 关键修复：操作完成后恢复提示符
        rl.resume();
        rl.prompt(); // 重新显示提示符等待下一条输入
      }
    }).on("close", () => {
      console.log("\n聊天会话已结束\n");
      process.exit(0);
    });
  }
}
