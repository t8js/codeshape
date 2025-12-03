# codeshape

Code checking utility, a thin abstraction layer over evolving toolsets:

- typecheck (with *tsgo* from `@typescript/native-preview`)
  - opt out with `--no-typecheck`
- lint + format (with *biome*)
  - opt out from fix commits with `--no-commit`
  - opt out from using `.gitignore` with `--vcs-disabled`

Usage: `npx codeshape <path> [...<more_paths>]`
