import { injectable } from "tsyringe";
import { Siliconflow } from "./siliconflow";
import { ReadStream } from "fs";
import * as fs from "fs/promises"; // 添加文件系统模块
import * as path from "path"; // 添加路径处理模块
import { tryResolve } from "@axiomai/utils";
import { WORKSPACE_ROOT } from "../tokens";
import "../tools/index";
import { createTools, runFunctionTool } from "../decorator";
import {
  concat,
  from,
  lastValueFrom,
  merge,
  Observable,
  of,
  Subject,
  tap,
} from "rxjs";
import {
  concatMap,
  endWith,
  filter,
  map,
  switchMap,
  toArray,
} from "rxjs/operators";
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
  private processChunk(
    chunk: Buffer | string,
    subject: Subject<{
      reasoning_content?: string;
      content?: string;
      tool_calls?: SiliconflowChatFunctionCall[];
    }>
  ) {
    const chunkStr = chunk.toString();
    const lines = chunkStr.split("\n").filter((line) => line.trim() !== "");

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;

      const eventData = line.substring(6);
      if (eventData === "[DONE]") return;

      try {
        const json = JSON.parse(eventData);
        const delta = json.choices[0]?.delta || {};

        subject.next({
          reasoning_content: delta.reasoning_content,
          content: delta.content,
          tool_calls: delta.tool_calls,
        });
      } catch (err) {
        console.error("\nError parsing JSON:", err);
      }
    }
  }
  private createPipelines(eventSubject: Subject<any>) {
    const reasoning$ = eventSubject.pipe(
      filter((e) => e.reasoning_content !== undefined),
      map((e) => e.reasoning_content)
    );

    const content$ = eventSubject.pipe(
      filter((e) => e.content !== undefined),
      map((e) => e.content)
    );

    const toolCalls$ = eventSubject.pipe(
      filter((e) => e.tool_calls !== undefined),
      map((e) => e.tool_calls)
    );

    return { reasoning$, content$, toolCalls$ };
  }

  private processContent(content$: Observable<string>) {
    return content$.pipe(
      toArray(),
      map((chunks) => chunks.join("")),
      tap((fullMessage) => this.addMessage("assistant", fullMessage))
    );
  }

  private writeToStdout(data: string) {
    if (data) process.stdout.write(data);
  }

  private processToolCalls(
    toolCalls$: Observable<SiliconflowChatFunctionCall[]>
  ) {
    return toolCalls$.pipe(
      toArray(),
      map((allCalls) => allCalls.flat()),
      switchMap((calls) => {
        const functionMap = new Map<string, SiliconflowChatFunctionCall>();

        calls
          .flat()
          .flat()
          .forEach((tc: SiliconflowChatFunctionCall) => {
            const existing = functionMap.get(tc.id) || tc;
            if (tc.function?.name) existing.function.name = tc.function.name;
            if (tc.function?.arguments)
              existing.function.arguments += tc.function.arguments;
            functionMap.set(tc.id, existing);
          });

        return from(Array.from(functionMap.values()));
      }),
      concatMap((toolCall) => runFunctionTool(toolCall)),
      toArray(),
      switchMap((results) => {
        const allResults = results.filter((it) => !!it);
        if (allResults.length > 0) {
          allResults.forEach((res) => {
            this.addMessage("tool", JSON.stringify(res.content), res.id);
          });
          return this.chatContinue();
        }
        return of(null);
      })
    );
  }

  chatContinue(): Observable<any> {
    return from(this.chat(this.getHistory())).pipe(
      switchMap((aiResponse: ReadStream) => {
        const eventSubject = new Subject<{
          reasoning_content?: string;
          content?: string;
          tool_calls?: SiliconflowChatFunctionCall[];
        }>();

        aiResponse.on("data", (chunk) =>
          this.processChunk(chunk, eventSubject)
        );
        aiResponse.on("end", () => eventSubject.complete());
        aiResponse.on("error", (err) => eventSubject.error(err));

        const { reasoning$, content$, toolCalls$ } =
          this.createPipelines(eventSubject);

        // 创建内容处理管道（不再忽略元素）
        const contentProcessing$ = this.processContent(content$).pipe(
          map((fullMessage) => ({ type: "content", message: fullMessage }))
        );

        // 创建工具调用处理管道（不再忽略元素）
        const toolCallsProcessing$ = this.processToolCalls(toolCalls$).pipe(
          map((results) => ({ type: "tool_calls", results }))
        );

        // 合并所有流并添加完成标记
        return merge(
          reasoning$.pipe(tap((it) => this.writeToStdout(it))),
          content$.pipe(tap((it) => this.writeToStdout(it))),
          contentProcessing$,
          toolCallsProcessing$
        ).pipe(
          // 添加完成标记确保至少有一个值
          endWith({ type: "complete" })
        );
      })
    );
  }
}
