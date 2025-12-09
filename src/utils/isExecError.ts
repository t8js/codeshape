import { ExecError } from "../types/ExecError.ts";

export function isExecError(x: unknown): x is ExecError {
  return x instanceof Error && "cmd" in x;
}
