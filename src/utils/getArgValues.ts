import { isFlag } from "./isFlag.ts";

let { argv } = process;

export function getArgValues(argName: string, fallback: string[]): string[];
export function getArgValues(argName: string): string[] | undefined;

export function getArgValues(argName: string, fallback?: string[]) {
  let k = argv.indexOf(argName);
  let values: string[] = [];

  while (k !== -1 && argv[k + 1] && !isFlag(argv[k + 1]))
    values.push(argv[++k]);

  return values.length === 0 ? fallback : values;
}
