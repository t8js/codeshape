import { isFlag } from "./isFlag.ts";

export async function getPaths(): Promise<string[]> {
  let paths: string[] = [];

  for (let arg of process.argv.slice(2)) {
    if (isFlag(arg)) break;

    paths.push(arg);
  }

  return paths;
}
