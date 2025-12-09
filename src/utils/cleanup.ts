import { access, unlink } from "node:fs/promises";
import { tempFiles } from "./tempFiles";

export async function cleanup() {
  await Promise.all(
    tempFiles.map(async (path) => {
      try {
        await access(path);
        await unlink(path);

        return path;
      } catch {
        return null;
      }
    }),
  );
}
