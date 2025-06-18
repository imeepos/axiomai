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
    if (input === null) return 'null';
    if (input === undefined) return 'undefined';
    if (typeof input === 'string') {
      return input;
    }
    if (input && typeof input.toString === 'function' && input.toString !== Object.prototype.toString) {
      return input.toString();
    }
    if (typeof input === 'object') {
      return JSON.stringify(input, null, 2);
    }
    return String(input);
  }
  private sanitizeText(text: string) {
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
