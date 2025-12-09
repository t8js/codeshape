import { copyFile } from "node:fs/promises";

export async function init() {
  await Promise.all([
    copyFile("src/_biome.json", "dist/_biome.json"),
    copyFile("src/_tsconfig.json", "dist/_tsconfig.json"),
  ]);
}

(async () => {
  await init();
})();
