import { container, inject, injectable } from 'tsyringe';
import { Siliconflow } from './siliconflow';
import { createWriteStream, ReadStream } from 'fs';
import * as fs from 'fs/promises'; // 添加文件系统模块
import * as path from 'path'; // 添加路径处理模块
import { tryJsonParse, tryResolve } from '@axiomai/utils';
import { WORKSPACE_ROOT } from '../tokens';
import '../tools/index';
import { from, merge, Observable, of, Subject, tap } from 'rxjs';
import { filter, map, switchMap, toArray } from 'rxjs/operators';
import { AiTool, createMcpClient, createMcpTools } from '../mcp';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { AxiosInstance } from 'axios';
export interface SiliconflowChatMessage {
  role: string;
  content: string;
  tool_call_id?: string;
}
export interface SiliconflowChatFunctionCall {
  index: number;
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}
@injectable()
export class SiliconflowChat {
  private conversationHistory: SiliconflowChatMessage[] = [];
  private mcp: Client;
  private tools: AiTool[];
  private client: AxiosInstance;
  constructor(@inject(Siliconflow) private siliconflow: Siliconflow) {}

  async onInit() {
    if (!this.mcp) {
      this.mcp = await createMcpClient();
      this.tools = await createMcpTools(this.mcp);
    }
    if (!this.client) {
      this.client = this.siliconflow.create();
    }
  }

  async chat(messages: SiliconflowChatMessage[]) {
    await this.onInit();
    const response = await this.client.request({
      url: `chat/completions`,
      method: `post`,
      responseType: 'stream',
      data: {
        model: `Pro/deepseek-ai/DeepSeek-R1`,
        messages: messages,
        max_token: 16384,
        temperature: 0.3,
        stream: true,
        tools: this.tools,
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
      const filePath = path.join(root, 'logs', filename);
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
      if (msg.role === 'system') return; // 跳过系统消息

      const header = msg.role === 'user' ? '## 🙋 用户' : '## 🤖 助手';
      md += `${header}\n\n${msg.content}\n\n---\n\n`;
    });

    return md;
  }
  private processChunk(
    chunk: Buffer | string,
    subject: Subject<{
      reasoning_content: string | null;
      content: string | null;
      tool_calls: SiliconflowChatFunctionCall[] | null;
    }>,
  ) {
    const chunkStr = chunk.toString();
    const lines = chunkStr.split('\n').filter((line) => line.trim() !== '');

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;

      const eventData = line.substring(6);
      if (eventData === '[DONE]') return;

      try {
        const json = JSON.parse(eventData);
        const delta = json.choices[0]?.delta || {};

        subject.next({
          reasoning_content: delta.reasoning_content || null,
          content: delta.content || null,
          tool_calls: delta.tool_calls || null,
        });
      } catch (err) {
        console.error('\nError parsing JSON:', err);
      }
    }
  }
  private createPipelines(
    eventSubject: Subject<{
      reasoning_content: string | null;
      content: string | null;
      tool_calls: SiliconflowChatFunctionCall[] | null;
    }>,
  ) {
    const content$ = eventSubject.pipe(
      filter((e) => e.content !== null),
      map((e) => e.content!),
    );

    const toolCalls$ = eventSubject.pipe(
      filter((e) => e.tool_calls !== null),
      map((e) => e.tool_calls!),
    );

    const reasoning$ = eventSubject.pipe(
      filter((e) => e.reasoning_content !== null),
      map((e) => e.reasoning_content!),
    );

    return { reasoning$, content$, toolCalls$ };
  }

  private writeToStdout(data: string) {
    if (data) process.stdout.write(data);
  }

  chatContinue(): Observable<any> {
    return from(this.chat(this.getHistory())).pipe(
      switchMap((aiResponse: ReadStream) => {
        const eventSubject = new Subject<{
          reasoning_content: string | null;
          content: string | null;
          tool_calls: SiliconflowChatFunctionCall[] | null;
        }>();
        const root = container.resolve(WORKSPACE_ROOT);
        const writeStream = createWriteStream(path.join(root, `logs/runtime_${Date.now()}.md`));
        aiResponse.pipe(writeStream);
        aiResponse.on('data', (chunk) => this.processChunk(chunk, eventSubject));
        aiResponse.on('end', () => eventSubject.complete());
        aiResponse.on('error', (err) => eventSubject.error(err));

        const { reasoning$, content$, toolCalls$ } = this.createPipelines(eventSubject);

        // 1. 首先处理推理内容（带标记）
        const reasoningPipeline$ = reasoning$.pipe(tap((it) => this.writeToStdout(it)));

        // 2. 然后处理响应内容（带标记）
        const contentPipeline$ = content$.pipe(tap((it) => this.writeToStdout(it)));

        const contentAddMessage$ = content$.pipe(
          toArray(),
          map((chunks) => chunks.join('')),
          tap((fullMessage) => this.addMessage('assistant', fullMessage)),
        );

        const step1$ = merge(reasoningPipeline$, contentPipeline$, contentAddMessage$);

        // 3. 最后处理工具调用（确保在内容处理之后）
        const toolCallsPipeline$ = toolCalls$.pipe(
          toArray(),
          map((allCalls) => allCalls.flat()),
          switchMap((calls) => {
            const functionMap = new Map<string, SiliconflowChatFunctionCall>();
            calls.forEach((tc) => {
              const existing = functionMap.get(tc.id) || tc;
              if (tc.function?.name) existing.function.name = tc.function.name;
              if (tc.function?.arguments) existing.function.arguments += tc.function.arguments;
              functionMap.set(tc.id, existing);
            });
            const tool_calls = [...functionMap.values()];

            return from(
              Promise.all(
                tool_calls.map(async (tool) => {
                  const result = await this.mcp.callTool({
                    name: tool.function.name,
                    arguments: tryJsonParse(tool.function.arguments),
                  });
                  return { result, id: tool.id };
                }),
              ),
            );
          }),
          switchMap((results) => {
            const allResults = results.filter((it) => !!it);
            if (results.length > 0) {
              allResults.forEach((res) => {
                this.addMessage('tool', JSON.stringify(res.result), res.id);
              });
              return this.chatContinue();
            }
            return of(null);
          }),
        );
        // 按顺序连接所有管道
        return merge(step1$, toolCallsPipeline$);
      }),
    );
  }
}
