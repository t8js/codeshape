import { readFile, writeFile } from "node:fs/promises";
import { canAccess } from "./utils/canAccess";
import { log } from "./utils/log";
import { join } from "node:path";
import { BiomeConfig } from "./types/BiomeConfig";
import { tempFiles } from "./utils/tempFiles";
import { exec } from "./utils/exec";
import { getPaths } from "./utils/getPaths";
import { formatDuration } from "@t8/date-format";
import { execOutput } from "./utils/execOutput";
import { getArgValue } from "./utils/getArgValue";

export async function runLintFormat() {
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
        await exec(`git commit -m ${JSON.stringify(getArgValue("-m", "lint"))}`);
    } catch {}
  }
}
