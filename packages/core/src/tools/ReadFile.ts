import { readFileSync } from "fs";
import { Input, Tool } from "../decorator";

export interface FileContent {
  filePath: string;
  content: string;
}
@Tool({
  description: `读取文件内容`,
})
export class ReadFile implements Tool<FileContent[]> {
  @Input({ description: "文件路径", typeFactory: () => String })
  filePath: string;

  async run() {
    const content = readFileSync(this.filePath, "utf-8");
    return [{ filePath: this.filePath, content: content }];
  }
}
