import { readFile } from "fs/promises";
import { Params, Tool } from "../decorators";
import { injectable } from "tsyringe";
import { z } from "zod";
@injectable()
export class ReadFile {
  @Tool({
    name: `readFile`,
    description: `读取指定文件的内容。当需要获取文件内容时使用此工具。`,
  })
  async run(@Params(`filePath`, z.string()) filePath: string) {
    try {
      const content = await readFile(filePath, "utf-8");
      return { content: [{ type: `text`, text: content }] };
    } catch (e) {
      throw new Error(
        `读取文件内容失败，失败原因如下：${(e as Error).message}`
      );
    }
  }
}
