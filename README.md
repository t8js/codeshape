# codeshape

Code checking utility, a thin abstraction layer over evolving toolsets:

- Typecheck (with `tsgo` from `@typescript/native-preview`)
  - use `--typecheck` to run it before other tasks
  - use `--typecheck-only` to run it without other tasks
- Emit types (with `dts-bundle-generator`): produces a single `.d.ts` file
  - use `--emit-types` to emit a type declaration file with the follow-up tweaks applied:
    - removing redundant re-exports that are already part of a wildcard re-export
    - replacing plain imports with type imports
    - replacing occasional single quotes and tabs with double quotes and spaces to comply with the general code style
  - use `--emit-untweaked-types` to emit a type declaration file without the follow-up tweaks
  - use `--emit-types-only` or `--emit-untweaked-types-only` to skip other tasks
- Lint + format (with `@biomejs/biome`)
  - use `--no-commit` to skip the fix commit
  - use `-m <message>` to set a fix commit message (default: `lint`)
  - use `--vcs-disabled` to opt out from using `.gitignore`

Usage: `npx codeshape <path> [...<more_paths>]`
