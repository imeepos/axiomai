import { writeFileSync } from "fs";
import { Input, Tool } from "../decorator";

@Tool({
  description: `将内容写入指定文件（覆盖原内容）。当需要修改文件或保存内容时使用此工具。`,
})
export class WriteFile implements Tool<{ success: boolean; message: string }> {
  @Input({ description: "要写入的文件路径", typeFactory: () => `string` })
  filePath: string;

  @Input({ description: `要写入的完整内容`, typeFactory: () => `string` })
  content: string;

  async run() {
    if (!this.filePath) throw new Error(`文件路径不能为空`);
    if (!this.content) throw new Error(`文件内容不能为空`);
    writeFileSync(this.filePath, this.content, "utf-8");
    return { success: true, message: `操作成功` };
  }
}
