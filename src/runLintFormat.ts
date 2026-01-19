import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { formatDuration } from "@t8/date-format";
import type { BiomeConfig } from "./types/BiomeConfig.ts";
import { canAccess } from "./utils/canAccess.ts";
import { currentDirName } from "./utils/currentDirName.ts";
import { exec } from "./utils/exec.ts";
import { execOutput } from "./utils/execOutput.ts";
import { getArgValue } from "./utils/getArgValue.ts";
import { getPaths } from "./utils/getPaths.ts";
import { log } from "./utils/log.ts";
import { tempFiles } from "./utils/tempFiles.ts";

export async function runLintFormat() {
  let t0 = Date.now();
  log("Lint and format [biome]");

  let includes: string[] = [];
  let isGitDir = await canAccess("./.git");

  for (let includesFile of [".lintincludes", ".biomeincludes"]) {
    if (await canAccess(includesFile)) {
      try {
        includes = (await readFile(includesFile))
          .toString()
          .trim()
          .split(/\r?\n/)
          .filter((x) => x.trim() !== "" && !x.startsWith("#"));
        break;
      } catch {}
    }
  }

  // If `includes` lists only negations, add all files first to exclude from
  if (includes.length !== 0 && includes.every((x) => x.startsWith("!")))
    includes.unshift("**");

  let hasOwnConfig = (
    await Promise.all(["./biome.json", "./biome.jsonc"].map(canAccess))
  ).includes(true);

  if (!hasOwnConfig) {
    let configPath = join(currentDirName, "_biome.json");
    let config = JSON.parse(
      (await readFile(configPath)).toString(),
    ) as BiomeConfig;

    delete config.$schema;

    config.vcs = {
      ...config.vcs,
      enabled: isGitDir && !process.argv.includes("--vcs-disabled"),
    };

    if (config.vcs.clientKind === "git" && config.vcs.useIgnoreFile)
      config.vcs.useIgnoreFile = await canAccess("./.gitignore");

    if (includes.length !== 0)
      config.files = {
        ...config.files,
        includes,
      };

    await writeFile("./biome.json", JSON.stringify(config, null, 2));

    tempFiles.push("./biome.json", "lint-format");
  }

  let { stdout, stderr } = await exec(
    `npx @biomejs/biome check --write ${(await getPaths()).join(" ")}`,
  );
  log(`${formatDuration(Date.now() - t0)}\n`);

  if (stderr) console.log(stderr);
  if (stdout) console.log(stdout);

  await tempFiles.remove("lint-format");

  if (isGitDir && !stderr && !process.argv.includes("--no-commit")) {
    try {
      await exec("git add *");

      let updated = (await execOutput("git diff --cached --name-only")) !== "";

      if (updated)
        await exec(
          `git commit -m ${JSON.stringify(getArgValue("-m", "lint"))}`,
        );
    } catch {}
  }
}
