import { copyFile } from "node:fs/promises";
import { join } from "node:path";
import { formatDuration } from "@t8/date-format";
import { currentDirName } from "./utils/currentDirName.ts";
import { exec } from "./utils/exec.ts";
import { getArgValue } from "./utils/getArgValue.ts";
import { log } from "./utils/log.ts";
import { tempFiles } from "./utils/tempFiles.ts";

export async function emitTypes() {
  let t0 = Date.now();
  log("emit types [dts-bundle-generator]");

  let configPath = getArgValue("--tsconfig");
  let inputFile = getArgValue("--emit-input", "index.ts");
  let outputFile = getArgValue("--emit-output", "dist/index.d.ts");

  if (!configPath) {
    configPath = `./tsconfig.${Math.random().toString(36).slice(2)}.json`;

    await copyFile(join(currentDirName, "_tsconfig.json"), configPath);

    tempFiles.push(configPath, "emit-types");
  }

  let { stdout, stderr } = await exec(
    `dts-bundle-generator -o ${outputFile} --project ${configPath} --export-referenced-types --silent --no-banner ${inputFile}`,
  );
  log(`${formatDuration(Date.now() - t0)}\n`);

  if (stderr) console.log(stderr);
  if (stdout) console.log(stdout);

  await tempFiles.remove("emit-types");
}
