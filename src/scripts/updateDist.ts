import { copyFile, lstat, readdir } from "node:fs/promises";

const configsDirPath = "src/configs";

export async function run() {
  let configs = await readdir(configsDirPath);

  await Promise.all(
    configs.map(async name => {
      let path = `${configsDirPath}/${name}`;

      if ((await lstat(path)).isFile()) await copyFile(path, `dist/${name}`);
    }),
  );
}

await run();
