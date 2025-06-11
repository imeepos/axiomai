import { injectable } from "tsyringe";
import { Siliconflow } from "./siliconflow";
import * as readline from "readline";
import { ReadStream } from "fs";
import * as fs from "fs/promises"; // 添加文件系统模块
import * as path from "path"; // 添加路径处理模块
import { tryResolve } from "@axiomai/utils";
import { WORKSPACE_ROOT } from "../tokens";
import "../tools/index";
import { createTools, runFunctionTool } from "../decorator";
import { from, of, Subject, tap } from "rxjs";
import { concatMap, map, switchMap, toArray } from "rxjs/operators";
export interface SiliconflowChatMessage {
  role: string;
  content: string;
  tool_call_id?: string;
}
export interface SiliconflowChatFunctionCall {
  index: number;
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}
@injectable()
export class SiliconflowChat {
  private conversationHistory: SiliconflowChatMessage[] = [];
  constructor(private siliconflow: Siliconflow) {}

  async chat(messages: SiliconflowChatMessage[]) {
    const client = this.siliconflow.create();
    const response = await client.request({
      url: `chat/completions`,
      method: `post`,
      responseType: "stream",
      data: {
        model: `Pro/deepseek-ai/DeepSeek-R1`,
        messages: messages,
        max_token: 16384,
        temperature: 0.7,
        stream: true,
        tools: createTools(),
      },
    });
    return response.data;
  }

  addMessage(role: string, content: string, tool_call_id?: string) {
    if (tool_call_id) {
      this.conversationHistory.push({ role, content, tool_call_id });
    } else {
      this.conversationHistory.push({ role, content });
    }
  }

  getHistory() {
    return [...this.conversationHistory];
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  // 新增：保存聊天记录为Markdown
  async saveToMarkdown(filename: string = `chat_${Date.now()}.md`) {
    try {
      const mdContent = this.generateMarkdown();
      const root = tryResolve(WORKSPACE_ROOT) || process.cwd();
      const filePath = path.join(root, "logs", filename);
      await fs.writeFile(filePath, mdContent);
      return filePath;
    } catch (error) {
      throw new Error(`保存失败: ${(error as Error).message}`);
    }
  }

  // 新增：生成Markdown内容
  private generateMarkdown(): string {
    let md = `# 聊天记录\n\n`;
    md += `> **会话时间**: ${new Date().toLocaleString()}\n\n`;

    this.conversationHistory.forEach((msg) => {
      if (msg.role === "system") return; // 跳过系统消息

      const header = msg.role === "user" ? "## 🙋 用户" : "## 🤖 助手";
      md += `${header}\n\n${msg.content}\n\n---\n\n`;
    });

    return md;
  }

  async startCLI() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "杨明明> ",
    });

    console.log(
      "开始聊天会话。输入“exit”结束会话，输入“clear”清除对话记录，输入“save”保存为Markdown。"
    );
    const root = tryResolve(WORKSPACE_ROOT) || process.cwd();

    this.addMessage("system", "你是杨明明的私人的AI助手，并用中文回答用户问题");
    this.addMessage("system", `WORKSPACE_ROOT: ${root}`);
    rl.prompt();

    rl.on("line", async (input) => {
      if (input.toLowerCase() === "exit") {
        rl.close();
        return;
      }

      if (input.toLowerCase() === "clear") {
        this.clearHistory();
        console.log("对话记录已清除。\n");
        rl.prompt();
        return;
      }

      // 新增：保存命令处理
      if (input.toLowerCase().startsWith("save")) {
        const filename = input.split(" ")[1] || undefined;
        try {
          const savedPath = await this.saveToMarkdown(filename);
          console.log(`\n聊天记录已保存至: ${savedPath}\n`);
        } catch (error) {
          console.error(`\n保存失败: ${(error as Error).message}\n`);
        }
        rl.prompt();
        return;
      }

      this.addMessage("user", input);

      rl.pause();
      try {
        const aiResponse: ReadStream = await this.chat(this.getHistory());
        const reasoning_content_subject: Subject<string> = new Subject();
        const content_subject: Subject<string> = new Subject();
        const tool_calls_subject: Subject<SiliconflowChatFunctionCall> =
          new Subject();
        reasoning_content_subject
          .pipe(tap((r) => process.stdout.write(r)))
          .subscribe();

        content_subject.pipe(tap((r) => process.stdout.write(r))).subscribe();
        content_subject
          .pipe(
            toArray(),
            map((its) => its.flat().join("")),
            tap((msg) => this.addMessage("assistant", msg))
          )
          .subscribe();
        // tool call
        tool_calls_subject
          .pipe(
            toArray(),
            switchMap((calls) => {
              const function_calls = calls.flat().flat();
              const functions: Map<string, SiliconflowChatFunctionCall> =
                new Map();
              function_calls.map((it) => {
                const fun = functions.get(it.id);
                if (fun) {
                  if (it.function) {
                    if (it.function.name) {
                      fun.function.name = it.function.name;
                    }
                    if (it.function.arguments) {
                      fun.function.arguments = it.function.arguments;
                    }
                  }
                } else {
                  functions.set(it.id, it);
                }
              });
              return from(functions.values());
            }),
            concatMap((it) => {
              return from(runFunctionTool(it));
            }),
            map((it) => {
              if (it) {
                this.addMessage(`tool`, JSON.stringify(it.content), it.id);
              }
              return it;
            })
          )
          .subscribe();
        aiResponse.on("data", (chunk) => {
          const chunkStr = chunk.toString();
          const lines = chunkStr
            .split("\n")
            .filter((line) => line.trim() !== "");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const eventData = line.substring(6);
              if (eventData === "[DONE]") {
                return;
              }
              try {
                const json = JSON.parse(eventData);
                const reasoning_content =
                  json.choices[0]?.delta?.reasoning_content;
                if (reasoning_content) {
                  reasoning_content_subject.next(reasoning_content);
                }
                const content = json.choices[0]?.delta?.content;
                if (content) {
                  content_subject.next(content);
                }
                const tool_calls = json.choices[0]?.delta?.tool_calls;
                if (tool_calls) {
                  tool_calls_subject.next(tool_calls);
                }
              } catch (err) {
                console.error("\nError parsing JSON:", err);
              }
            }
          }
        });
        aiResponse.on("end", () => {
          reasoning_content_subject.complete();
          content_subject.complete();
          tool_calls_subject.complete();
          console.log("\n");
          rl.resume();
          rl.prompt();
        });
        aiResponse.on("error", (err) => {
          reasoning_content_subject.error(err);
          content_subject.error(err);
          tool_calls_subject.error(err);
          rl.resume();
          rl.prompt();
        });
      } catch (error) {
        console.error("\nError:", (error as Error).message);
        rl.resume();
        rl.prompt();
      }
    }).on("close", () => {
      console.log("\n聊天会话已结束\n");
      process.exit(0);
    });
  }
}
