import { CallToolResult } from '@modelcontextprotocol/sdk/types';
import { injectable } from 'tsyringe';
@injectable()
export class McpOutputService {
  private convertToMCPFormat(input: any): CallToolResult {
    try {
      const text = this.normalizeInput(input);
      const sanitizedText = this.sanitizeText(text);
      return {
        content: [
          {
            type: 'text',
            text: sanitizedText,
          },
        ],
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
  private normalizeInput(input: any) {
    // 处理null和undefined
    if (input === null) return 'null';
    if (input === undefined) return 'undefined';

    // 处理字符串
    if (typeof input === 'string') {
      return input;
    }

    // 处理有toString方法的对象（如PouchOutput）
    if (input && typeof input.toString === 'function' && input.toString !== Object.prototype.toString) {
      return input.toString();
    }

    // 处理数组和普通对象
    if (typeof input === 'object') {
      return JSON.stringify(input, null, 2);
    }

    // 其他类型直接转换
    return String(input);
  }
  private sanitizeText(text: string) {
    // 对于MCP协议，我们实际上不需要做任何转义
    // emoji、中文字符、markdown都应该保留
    // MCP的content格式本身就支持UTF-8字符
    return text;
  }
  private handleError(error: unknown): CallToolResult {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      content: [
        {
          type: 'text',
          text: `❌ 执行失败: ${errorMessage}`,
        },
      ],
    };
  }
  createSuccessResponse(text: string) {
    return this.convertToMCPFormat(text);
  }
  createErrorResponse(message: unknown) {
    return this.handleError(message);
  }
}
