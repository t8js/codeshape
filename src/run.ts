#!/usr/bin/env node
import { exec as defaultExec } from "node:child_process";
import { access, readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { formatDuration } from "@t8/date-format";
import { getPaths } from "./getPaths.ts";
import { isFlag } from "./isFlag.ts";

const { argv } = process;

const exec = promisify(defaultExec);
const execOutput = async (cmd: string) => (await exec(cmd)).stdout.trim();
const log = argv.includes("--silent") ? () => {} : console.log;

let tempFiles: string[] = [];

async function cleanup() {
  tempFiles = (
    await Promise.all(
      tempFiles.map(async (path) => {
        try {
          await access(path);
          await unlink(path);

          return path;
        } catch {
          return null;
        }
      }),
    )
  ).filter((path) => path !== null);
}

async function canAccess(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function getCommitMessage() {
  let k = argv.indexOf("-m");

  return k !== -1 && argv[k + 1] && !isFlag(argv[k + 1]) ? argv[k + 1] : "lint";
}

async function runTypeCheck() {
  if (!argv.includes("--typecheck")) return;

  let t0 = Date.now();
  log("typecheck [tsgo]");

  let { stdout, stderr } = await exec("tsgo --noEmit");
  log(`${formatDuration(Date.now() - t0)}\n`);

  if (stdout) console.log(stdout);

  if (stderr) {
    console.log(stderr);
    process.exit(1);
  }
}

type BiomeConfig = {
  $schema?: string;
  files?: {
    includes?: string[];
  };
  vcs?: {
    enabled?: boolean;
    clientKind?: string;
    useIgnoreFile?: boolean;
  };
};

async function runCodeShape() {
  let t0 = Date.now();
  log("lint and format [biome]");

  let includes: string[] = [];
  let isGitDir = await canAccess("./.git");

  try {
    includes = (await readFile("./.biomeincludes"))
      .toString()
      .trim()
      .split(/\r?\n/)
      .filter((x) => x !== "");
  } catch {}

  let hasOwnConfig = (
    await Promise.all(["./biome.json", "./biome.jsonc"].map(canAccess))
  ).includes(true);

  if (!hasOwnConfig) {
    let configPath = join(__dirname, "_biome.json");
    let config = JSON.parse(
      (await readFile(configPath)).toString(),
    ) as BiomeConfig;

    delete config.$schema;

    config.vcs = {
      ...config.vcs,
      enabled: isGitDir && !argv.includes("--vcs-disabled"),
    };

    if (config.vcs.clientKind === "git" && config.vcs.useIgnoreFile)
      config.vcs.useIgnoreFile = await canAccess("./.gitignore");

    if (includes.length !== 0)
      config.files = {
        ...config.files,
        includes,
      };

    await writeFile("./biome.json", JSON.stringify(config, null, 2));

    tempFiles.push("./biome.json");
  }

  let { stdout, stderr } = await exec(
    `npx @biomejs/biome check --write ${(await getPaths()).join(" ")}`,
  );
  log(`${formatDuration(Date.now() - t0)}\n`);

  if (stderr) console.log(stderr);
  if (stdout) console.log(stdout);

  await cleanup();

  if (isGitDir && !stderr && !argv.includes("--no-commit")) {
    try {
      await exec("git add *");

      let updated = (await execOutput("git diff --cached --name-only")) !== "";

      if (updated)
        await exec(`git commit -m ${JSON.stringify(getCommitMessage())}`);
    } catch {}
  }
}

async function run() {
  await runTypeCheck();
  await runCodeShape();
}

type ExecError = {
  cmd: string;
  stdout?: string;
  stderr?: string;
};

function isExecError(x: unknown): x is ExecError {
  return x instanceof Error && "cmd" in x;
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
