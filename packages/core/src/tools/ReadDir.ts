import { Params, Tool } from '../decorators';
import { injectable } from 'tsyringe';
import { z } from 'zod';
import { readdir } from 'fs/promises';
@injectable()
export class ReadDir {
  @Tool({
    name: `readdir`,
    description: `Reads the contents of a directory`,
  })
  async run(@Params(`filePath`, z.string()) filePath: string) {
    return await readdir(filePath, 'utf-8');
  }
}
