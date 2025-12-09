import { exec } from "./exec.ts";

export const execOutput = async (cmd: string) =>
  (await exec(cmd)).stdout.trim();
