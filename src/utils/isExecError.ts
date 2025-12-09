import { ExecError } from "../types/ExecError";

export function isExecError(x: unknown): x is ExecError {
  return x instanceof Error && "cmd" in x;
}
