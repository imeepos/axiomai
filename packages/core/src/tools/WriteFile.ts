import { writeFile } from 'fs/promises';
import { Params, Tool } from '../decorators';
import { z } from 'zod';
import { injectable } from 'tsyringe';
import { ensureDir } from 'fs-extra';
import { dirname } from 'path';

@injectable()
export class WriteFile {
  @Tool({
    name: 'writeFile',
    description: 'Writes content to a file, creating directories if needed',
  })
  async run(
    @Params('filePath', z.string().min(1, 'File path required'))
    filePath: string,

    @Params('content', z.string().min(1, 'Content cannot be empty'))
    content: string,
  ) {
    const directory = dirname(filePath);
    await ensureDir(directory);
    await writeFile(filePath, content, 'utf-8');
    return 'File written successfully';
  }
}
