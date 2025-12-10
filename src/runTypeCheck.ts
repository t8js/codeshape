import { formatDuration } from "@t8/date-format";
import { exec } from "./utils/exec.ts";
import { log } from "./utils/log.ts";

export async function runTypeCheck() {
  let t0 = Date.now();
  log("Typecheck [tsgo]");

  let { stdout, stderr } = await exec("tsgo --noEmit");
  log(`${formatDuration(Date.now() - t0)}\n`);

  if (stdout) console.log(stdout);

  if (stderr) {
    console.log(stderr);
    process.exit(1);
  }
}
