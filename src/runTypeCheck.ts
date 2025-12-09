import { formatDuration } from "@t8/date-format";
import { exec } from "./utils/exec";
import { log } from "./utils/log";

export async function runTypeCheck() {
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
