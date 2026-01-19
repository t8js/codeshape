# codeshape

Code postprocessing utility, a thin abstraction layer over evolving toolsets.

Usage: `npx codeshape [...space-separated entry points] [...--flags]`

Default entry point: `./index.ts`

Performed tasks:

- Typecheck (with `tsgo` from `@typescript/native-preview`)
  - use `--no-typecheck` to skip this task
  - use `--typecheck-only` to skip other tasks
- Lint + format (with `@biomejs/biome`)
  - use `--no-lint-format` to skip this task
  - use `--lint-format-only` to skip other tasks
  - use `--no-commit` to skip the fix commit
  - use `-m <message>` to set a fix commit message (default: `lint`)
  - use `--vcs-disabled` to opt out from using `.gitignore`
  - use a `.lintincludes` plain-text file to list path patterns affected by this task (in a format similar to `.gitignore`)
- Compile (with `tsdown`)
  - use `--no-compile` to skip this task
  - use `--compile-only` to skip other tasks
  - use `--no-dts` to skip emitting a type declaration file
  - use `--compile-input <...space-separated paths>` (default: `./index.ts`) and `--compile-output <path>` (default: `./dist`) to set an entry point and an output directory
  - use `--compile-platform` to set a target platform (default: `node`, other options: `browser`, `neutral`)
  - use `--minify` to minify the output
  - use `--tsconfig <path>` to point to a custom TS config file

Use `--check` to run only the checking tasks: typecheck, lint + format.

Example 1: `npx codeshape` runs typechecking, linting, formatting, adding a fix commit if needed, compiling `./index.ts` to `./dist/index.mjs` and `./dist/index.cjs`, emitting type declarations to `./dist/index.d.ts`.

Example 2: `npx codeshape --check` runs typechecking, linting, formatting, adding a fix commit if needed.

Example 3: `npx codeshape --check --no-commit` runs typechecking, linting, formatting (without adding a fix commit).
