import { exec } from "./exec";

export const execOutput = async (cmd: string) => (await exec(cmd)).stdout.trim();
