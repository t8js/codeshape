import { readFile, writeFile } from "node:fs/promises";
import { log } from "./utils/log.ts";
import { formatDuration } from "@t8/date-format";
import { getEmitOptions } from "./utils/getEmitOptions.ts";

function collapseComments(s: string) {
  let lastLineEnd = -1;
  let lastClosing = -1;

  for (let i = s.length - 1; i >= 0; i--) {
    let c = s[i], prev = s[i + 1] ?? "";

    if (c === "*" && prev === "/") lastClosing = i + 2;
    else if (c === "\r" && prev === "\n") lastLineEnd = i;
    else if (c === "\n") lastLineEnd = i;
    else if (c === "/" && prev === "*")
      s = `${s.slice(0, i)}/*#${i},${lastClosing}*/${s.slice(lastClosing)}`;
    else if (c === "/" && prev === "/")
      s = `${s.slice(0, i)}/*#${i},${lastLineEnd}*/${s.slice(lastLineEnd)}`;
  }

  return s;
}

function expandCollapsed(s: string, s0: string) {
  let startMarker = "/*#";
  let endMarker = "*/";

  let k0 = s.length;
  let k1 = 0;

  while ((k0 = s.lastIndexOf(startMarker, k0)) !== -1) {
    k1 = s.indexOf(endMarker, k0);

    if (k1 === -1) continue;

    let indices = s.slice(k0 + startMarker.length, k1).split(",").map(Number);

    if (indices.length < 2 || indices.some(i => Number.isNaN(i))) continue;
    if (indices[1] === -1) indices[1] = s0.length;

    s = `${s.slice(0, k0)}${s0.slice(indices[0], indices[1])}${s.slice(k1 + endMarker.length)}`;
  }

  return s;
}

function getImportMap(s: string) {
  let importMap: Record<string, string> = {}; // { entity: source }

  let startMarker = "import ";

  let startMarker2 = "{";
  let endMarker2 = "}";

  let startMarker3 = "from ";
  let endMarker3 = ";";

  let k0 = 0;
  let k1 = 0;

  while ((k0 = s.indexOf(startMarker, k1)) !== -1) {
    k0 = s.indexOf(startMarker2, k0);
    k1 = s.indexOf(endMarker2, k0);

    if (k0 === -1 || k1 === -1) continue;

    let entities = s.slice(k0 + startMarker2.length, k1)
      .trim()
      .replace(/\s+/g, " ")
      .replace(/,\s*$/, "")
      .split(", ")
      .filter(Boolean);

    if (entities.length === 0) continue;

    let k2 = s.indexOf(startMarker3, k1);
    let k3 = s.indexOf(endMarker3, k2);

    if (k2 === -1 || k3 === -1) continue;

    let source = s.slice(k2 + startMarker3.length, k3).trim().replace(/(^['"]|['"]$)/g, "");

    for (let entity of entities) importMap[entity] = source;
  }

  return importMap;
}

function getWildcardExports(s: string) {
  let wildcardExports = new Set<string>();

  let startMarker = "export * from ";
  let endMarker = ";";

  let k0 = 0;
  let k1 = 0;

  while ((k0 = s.indexOf(startMarker, k1)) !== -1) {
    k1 = s.indexOf(endMarker, k0);

    if (k1 === -1) continue;

    let source = s.slice(k0 + startMarker.length, k1).trim().replace(/(^['"]|['"]$)/g, "");

    wildcardExports.add(source);
  }

  return wildcardExports;
}

/**
 * Removes re-exports that are part of an existing wildcard re-export.
 */
function removeRedundantReexports(s: string) {
  let importMap = getImportMap(s);
  let wildcardExports = getWildcardExports(s);

  let startMarker = "export {";
  let endMarker = "};";

  let k0 = s.length;
  let k1 = 0;

  while ((k0 = s.lastIndexOf(startMarker, k0 - 1)) !== -1) {
    k1 = s.indexOf(endMarker, k0);

    if (k1 === -1) continue;

    let entities = s.slice(k0 + startMarker.length, k1)
      .trim()
      .replace(/\s+/g, " ")
      .replace(/,\s*$/, "")
      .split(", ")
      .filter(Boolean);

    if (entities.length === 0) continue;

    let updatedEntities = entities.filter(entity => {
      let source = importMap[entity];

      return !source || !wildcardExports.has(source);
    });

    if (updatedEntities.length === 0)
      s = `${s.slice(0, k0)}${s.slice(k1 + endMarker.length)}`;
    else {
      let exportList = updatedEntities.map(s => `  ${s}`).join(",\n");

      s = `${s.slice(0, k0 + startMarker.length)}\n${exportList}\n${s.slice(k1)}`;
    }
  }

  return s;
}

function useTypeExports(s: string) {
  return s.replace(/^import \{ (?!type )/g, "import type { ");
}

function tweakQuotes(s: string) {
  return s.replace(/ from '([^']+)';/g, ' from "$1";');
}

function collapseBlankLines(s: string) {
  return `${s.replace(/(\r?\n){3,}/g, "$1$1").trim()}\n`;
}

export async function tweakTypes() {
  let t0 = Date.now();
  log("tweak types");

  let { outputFile } = getEmitOptions();
  let s0 = (await readFile(outputFile)).toString();
  let s = s0;

  // Temporarily collapse comments so that they are not affected by
  // the further transforms
  s = collapseComments(s);

  s = removeRedundantReexports(s);

  // Related dts-bundle-generator's issue:
  // @see https://github.com/timocov/dts-bundle-generator/issues/320
  s = useTypeExports(s);

  s = tweakQuotes(s);
  s = expandCollapsed(s, s0);
  s = collapseBlankLines(s);

  if (s !== s0) await writeFile(outputFile, s);
  log(`${formatDuration(Date.now() - t0)}\n`);
}
