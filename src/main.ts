import "reflect-metadata";
import { container, WORKSPACE_ROOT, SiliconflowChat } from "@axiomai/core";
import { config } from "dotenv";
async function main() {
  config();
  container.register(WORKSPACE_ROOT, { useValue: process.cwd() });
  const chat = container.resolve(SiliconflowChat);
  await chat.startCLI();
}
main().catch((e) => {
  console.error(e);
});
