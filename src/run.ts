#!/usr/bin/env node
import { emitTypes } from "./emitTypes.ts";
import { runLintFormat } from "./runLintFormat.ts";
import { runTypeCheck } from "./runTypeCheck.ts";
import { isExecError } from "./utils/isExecError.ts";
import { tempFiles } from "./utils/tempFiles.ts";

let { argv } = process;

async function run() {
  if (argv.includes("--typecheck-only")) return await runTypeCheck();
  if (argv.includes("--emit-types-only")) return await emitTypes();

  if (argv.includes("--typecheck")) await runTypeCheck();
  if (argv.includes("--emit-types")) await emitTypes();

  await runLintFormat();
}

(async () => {
  try {
    await run();
  } catch (error) {
    await tempFiles.remove("all");

    if (!isExecError(error)) throw error;

    if (error.stderr) console.log(error.stderr);
    if (error.stdout) console.log(error.stdout);

    process.exit(1);
  }
})();
