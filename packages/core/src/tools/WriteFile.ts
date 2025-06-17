import { writeFile } from "fs/promises";
import { Params, Tool } from "../decorators";
import { z } from "zod";
import { injectable } from "tsyringe";

@injectable()
export class WriteFile {
  @Tool({
    name: `writeFile`,
  })
  async run(
    @Params(`filePath`, z.string()) filePath: string,
    @Params(`content`, z.string()) content: string
  ) {
    try {
      if (!filePath) throw new Error(`文件路径不能为空`);
      if (!content) throw new Error(`文件内容不能为空`);
      await writeFile(filePath, content, "utf-8");
      return { content: [{ type: `text`, text: `写入文件${filePath}成功` }] };
    } catch (e) {
      throw new Error(
        `写入文件${filePath}失败，原因如下：${(e as Error).message}`
      );
    }
  }
}
