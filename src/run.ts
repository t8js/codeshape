#!/usr/bin/env node
import { emitTypes } from "./emitTypes.ts";
import { runLintFormat } from "./runLintFormat.ts";
import { runTypeCheck } from "./runTypeCheck.ts";
import { tweakTypes } from "./tweakTypes.ts";
import { isExecError } from "./utils/isExecError.ts";
import { tempFiles } from "./utils/tempFiles.ts";

let { argv } = process;

async function run() {
  if (argv.includes("--typecheck-only")) {
    await runTypeCheck();
    return;
  }

  if (argv.includes("--emit-untweaked-types-only")) {
    await emitTypes();
    return;
  }

  if (argv.includes("--emit-types-only")) {
    await emitTypes();
    await tweakTypes();
    return;
  }

  if (argv.includes("--typecheck")) await runTypeCheck();

  if (argv.includes("--emit-untweaked-types"))
    await emitTypes();
  else if (argv.includes("--emit-types")) {
    await emitTypes();
    await tweakTypes();
  }

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
