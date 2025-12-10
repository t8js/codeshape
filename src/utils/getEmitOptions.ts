import { getArgValue } from "./getArgValue.ts";

export function getEmitOptions() {
  let inputFile = getArgValue("--emit-input", "index.ts");
  let outputFile = getArgValue("--emit-output", "dist/index.d.ts");

  return { inputFile, outputFile };
}
