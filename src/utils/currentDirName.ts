import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

let currentFileName = fileURLToPath(import.meta.url);

export let currentDirName = dirname(currentFileName);
