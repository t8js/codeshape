import { readFile, rename, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { formatDuration } from "@t8/date-format";
import { exec } from "./utils/exec.ts";
import { getArgValue } from "./utils/getArgValue.ts";
import { getArgValues } from "./utils/getArgValues.ts";
import { log } from "./utils/log.ts";

const { argv } = process;

export async function compile() {
  let t0 = Date.now();
  log("Compile [tsdown]");

  let input = getArgValues("--compile-input", ["./index.ts"]);
  let output = getArgValue("--compile-output", "./dist");
  let platform = getArgValue("--compile-platform");
  let tsConfigPath = getArgValue("--tsconfig");

  let params = [
    input.join(" "),
    `-d ${output}`,
    "--format esm",
    "--format cjs",
  ];

  if (!argv.includes("--no-dts")) params.push("--dts");
  if (argv.includes("--minify")) params.push("--minify");

  if (platform) params.push(`--platform ${platform}`);
  if (tsConfigPath) params.push(`--tsconfig ${tsConfigPath}`);

  let { stdout, stderr } = await exec(`tsdown ${params.join(" ")}`);
  log(`${formatDuration(Date.now() - t0)}\n`);

  if (stderr) console.log(stderr);
  if (stdout) console.log(stdout);

  try {
    await unlink(join(output, "index.d.cts"));
  } catch {}

  try {
    await rename(join(output, "index.d.mts"), join(output, "index.d.ts"));
  } catch {}

  await Promise.all(
    ["index.cjs", "index.mjs", "index.d.ts"].map(async (name) => {
      try {
        let path = join(output, name);
        let s = (await readFile(path)).toString();

        s = s
          .replace(/^\/\/#(region \S+|endregion)$/gm, "")
          .replace(/\r\n/g, "\n")
          .replace(/\n{3,}/g, "\n\n")
          .replace(/^\t+/gm, (t) => t.replaceAll("\t", "  "))
          .trim();

        await writeFile(path, `${s}\n`);
      } catch {}
    }),
  );

  let affectedPackageProps = {
    main: `${output}/index.cjs`,
    module: `${output}/index.mjs`,
    types: `${output}/index.d.ts`,
  };

  console.log(JSON.stringify(affectedPackageProps, null, 2));
}
