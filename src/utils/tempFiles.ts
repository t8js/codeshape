import { unlink } from "node:fs/promises";
import { ScriptTag } from "../types/ScriptTag";

let taggedList: {
  path: string;
  tag: ScriptTag;
  removed?: boolean; 
}[] = [];

export let tempFiles = {
  push(path: string, tag: ScriptTag) {
    taggedList.push({ path, tag });
  },
  async remove(tag: ScriptTag) {
    await Promise.all(
      taggedList.map(async item => {
        if (item.removed || (tag !== "all" && item.tag !== tag)) return;

        try {
          await unlink(item.path);
          item.removed = true;
        } catch {}
      }),
    );

    for (let i = taggedList.length - 1; i >= 0; i--) {
      let item = taggedList[i];

      if (item.removed) taggedList.splice(i, 1);
    }
  }
};
