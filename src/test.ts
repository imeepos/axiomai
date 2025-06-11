import "reflect-metadata";
import { config } from "dotenv";
config();
import { runFunctionTool } from "@axiomai/core";

const json = {
    "name": "string",
    "arguments": "string"
};

runFunctionTool({ id: ``, index: 0, type: "function", function: json });
