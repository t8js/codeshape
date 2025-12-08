# codeshape

Code checking utility, a thin abstraction layer over evolving toolsets:

- typecheck (with *tsgo* from `@typescript/native-preview`)
  - use `--typecheck` to run it before other checks
  - use `--typecheck-only` to run it without other checks
- lint + format (with *biome*)
  - opt out from fix commits with `--no-commit`
  - opt out from using `.gitignore` with `--vcs-disabled`

Usage: `npx codeshape <path> [...<more_paths>]`
