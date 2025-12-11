#!/usr/bin/env node
import { compile } from "./compile.ts";
import { runLintFormat } from "./runLintFormat.ts";
import { runTypeCheck } from "./runTypeCheck.ts";
import { isExecError } from "./utils/isExecError.ts";
import { tempFiles } from "./utils/tempFiles.ts";

let { argv } = process;

async function run() {
  if (argv.includes("--typecheck-only")) {
    await runTypeCheck();
    return;
  }

  if (argv.includes("--lint-format-only")) {
    await runLintFormat();
    return;
  }

  if (argv.includes("--compile-only")) {
    await compile();
    return;
  }

  if (argv.includes("--check")) {
    await runTypeCheck();
    await runLintFormat();
    return;
  }

  if (!argv.includes("--no-typecheck")) await runTypeCheck();
  if (!argv.includes("--no-lint-format")) await runLintFormat();
  if (!argv.includes("--no-compile")) await compile();
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
