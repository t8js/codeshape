import { isFlag } from "./isFlag.ts";

let { argv } = process;

export function getArgValue(argName: string, fallback: string): string;
export function getArgValue(argName: string): string | undefined;

export function getArgValue(argName: string, fallback?: string) {
  let k = argv.indexOf(argName);

  return k !== -1 && argv[k + 1] && !isFlag(argv[k + 1])
    ? argv[k + 1]
    : fallback;
}
