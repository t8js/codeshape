#!/usr/bin/env node
import { runLintFormat } from "./runLintFormat.ts";
import { runTypeCheck } from "./runTypeCheck.ts";
import { cleanup } from "./utils/cleanup.ts";
import { isExecError } from "./utils/isExecError.ts";

let { argv } = process;

async function run() {
  if (argv.includes("--typecheck-only")) return await runTypeCheck();

  if (argv.includes("--typecheck")) await runTypeCheck();

  await runLintFormat();
}

(async () => {
  try {
    await run();
  } catch (error) {
    await cleanup();

    if (!isExecError(error)) throw error;

    if (error.stderr) console.log(error.stderr);
    if (error.stdout) console.log(error.stdout);

    process.exit(1);
  }
})();
