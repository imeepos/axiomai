import "reflect-metadata";
import { config } from "dotenv";
config();

import {
  container,
  WORKSPACE_ROOT,
  Tool,
  Params,
  createMcpServer,
  injectable,
} from "@axiomai/core";
import { z } from "zod";

@injectable()
export class Demo {
  @Tool()
  demo(@Params(z.number()) a: number) {
    return a;
  }
}

container.register(WORKSPACE_ROOT, { useValue: process.cwd() });

async function main() {
  await createMcpServer(container);
}

main().catch((e) => {
  console.error("Application failed:", {
    message: e.message,
    stack: e.stack,
    timestamp: new Date().toISOString(),
  });
  process.exit(1);
});
