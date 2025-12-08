# codeshape

Code checking utility, a thin abstraction layer over evolving toolsets:

- typecheck (with *tsgo* from `@typescript/native-preview`)
  - use `--typecheck` to run it before other checks
  - use `--typecheck-only` to run it without other checks
- lint + format (with *biome*)
  - use `--no-commit` to skip the fix commit
  - use `--vcs-disabled` to opt out from using `.gitignore`

Usage: `npx codeshape <path> [...<more_paths>]`
