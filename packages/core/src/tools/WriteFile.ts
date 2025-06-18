import { writeFile } from 'fs/promises';
import { Params, Tool } from '../decorators';
import { z } from 'zod';
import { injectable } from 'tsyringe';
import { ensureDir } from 'fs-extra';
import { dirname } from 'path';
@injectable()
export class WriteFile {
  @Tool({
    name: `writeFile`,
    description: `Asynchronously writes data to a file, replacing the file if it already exists`,
  })
  async run(@Params(`filePath`, z.string()) filePath: string, @Params(`content`, z.string()) content: string) {
    if (!filePath) throw new Error(`文件路径不能为空`);
    if (!content) throw new Error(`文件内容不能为空`);
    ensureDir(dirname(filePath));
    await writeFile(filePath, content, 'utf-8');
    return 'success';
  }
}
