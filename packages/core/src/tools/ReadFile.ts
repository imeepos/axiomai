import { readFileSync } from "fs";
import { Input, Tool } from "../decorator";

export interface FileContent {
  filePath: string;
  content: string;
}
@Tool({
  description: `读取指定文件的内容。当需要获取文件内容时使用此工具。`,
})
export class ReadFile implements Tool<FileContent[]> {
  @Input({ description: "要读取的文件路径", typeFactory: () => `string` })
  filePath: string;

  async run() {
    const content = readFileSync(this.filePath, "utf-8");
    return [{ filePath: this.filePath, content: content }];
  }
}
