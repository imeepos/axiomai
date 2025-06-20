import { readFile } from 'fs/promises';
import { Params, Tool } from '../decorators';
import { injectable } from 'tsyringe';
import { z } from 'zod';
@injectable()
export class ReadFile {
  @Tool({
    name: `readFile`,
    description: `Asynchronously reads the entire contents of a file.`,
  })
  async run(@Params(`filePath`, z.string()) filePath: string) {
    return await readFile(filePath, 'utf-8');
  }
}
