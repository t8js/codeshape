import { join } from "node:path";
import { getArgValue } from "./utils/getArgValue";
import { copyFile } from "node:fs/promises";
import { exec } from "./utils/exec";
import { log } from "./utils/log";
import { formatDuration } from "@t8/date-format";
import { tempFiles } from "./utils/tempFiles";

export async function emitTypes() {
  let t0 = Date.now();
  log("emit types [tsgo]");

  let configPath = getArgValue("--project") ?? getArgValue("-p");

  if (!configPath) {
    configPath = `./tsconfig.${Math.random().toString(36).slice(2)}.json`;

    await copyFile(join(__dirname, "_tsconfig.json"), configPath);
    
    tempFiles.push(configPath, "emit-types");
  }

  let { stdout, stderr } = await exec(`tsgo -p ${configPath}`);
  log(`${formatDuration(Date.now() - t0)}\n`);

  if (stderr) console.log(stderr);
  if (stdout) console.log(stdout);

  await tempFiles.remove("emit-types");
}
