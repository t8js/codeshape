import { formatDuration } from "@t8/date-format";
import { exec } from "./utils/exec.ts";
import { getArgValue } from "./utils/getArgValue.ts";
import { log } from "./utils/log.ts";
import { rename, unlink } from "node:fs/promises";

const { argv } = process;

export async function compile() {
  let t0 = Date.now();
  log("Compile [tsdown]");

  let input = getArgValue("--compile-input", "./index.ts");
  let output = getArgValue("--compile-output", "./dist");
  let platform = getArgValue("--compile-platform");
  let tsConfigPath = getArgValue("--tsconfig");

  let params = [
    input,
    `-d ${output}`,
    "--format esm",
    "--format cjs",
  ];

  if (!argv.includes("--no-dts")) params.push("--dts");
  if (platform) params.push(`--platform ${platform}`);
  if (tsConfigPath) params.push(`--tsconfig ${tsConfigPath}`);

  let { stdout, stderr } = await exec(`npx tsdown ${params.join(" ")}`);
  log(`${formatDuration(Date.now() - t0)}\n`);

  if (stderr) console.log(stderr);
  if (stdout) console.log(stdout);

  try {
    await unlink(`${output}/index.d.cts`);
  } catch {}

  try {
    await rename(`${output}/index.d.mts`, `${output}/index.d.ts`);
  } catch {}

  let affectedPackageProps = {
    main: `${output}/index.cjs`,
    module: `${output}/index.mjs`,
    types: `${output}/index.d.ts`,
  };

  console.log(JSON.stringify(affectedPackageProps, null, 2));
}
