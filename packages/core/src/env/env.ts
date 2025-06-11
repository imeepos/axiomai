import { injectable, InjectionToken } from "tsyringe";
import {} from "class-validator";
@injectable()
export class Env {
  get(token: InjectionToken<string>): string {
    return process.env[token as string] as string;
  }
}
