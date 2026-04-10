# Git hooks (Husky)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Files](#files)
- [`pre-commit` hook runs the following checks:](#pre-commit-hook-runs-the-following-checks)
- [`commit-msg` hook](#commit-msg-hook)
- [Setup](#setup)
- [Skipping hooks](#skipping-hooks)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

This directory holds **Husky** hook scripts. After you run `yarn husky` from the repository root, Git’s `core.hooksPath` points here so these run on `git commit` (and related events).

## Files

| Path | Role |
|------|------|
| `pre-commit` | Runs checks before a commit is created. |
| `commit-msg` | Runs checks on the commit message file. |
| `scripts/` | Shell helpers invoked from `pre-commit` (frontend Lerna). |

The generated directory `_/` is created by Husky and is not committed.
It contains small shims Git executes first.

## `pre-commit` hook runs the following checks:

1. **`pre-commit run --hook-stage pre-commit`** invokes the [pre-commit](https://pre-commit.com/) CLI, which reads [`.pre-commit-config.yaml`](../.pre-commit-config.yaml) and runs hooks such as Ruff, trailing-whitespace / end-of-file-fixer, YAML/TOML checks, large-file checks, ShellCheck, and doctoc for README files.

2. **`cd` to the repository root** since the helper script needs that working directory so `git add` paths and `cd frontend` resolve correctly.

3. **`scripts/run-frontend-lerna-pre-commit.sh`** runs `yarn husky:pre-commit` in `frontend/` if any staged path is under `frontend/`, which uses Lerna to run each workspace package’s `pre-commit` script such as Prettier, ESLint, typecheck, and staged tests.

## `commit-msg` hook

Runs **`pre-commit run --hook-stage commit-msg`**, which executes **commitlint** (Conventional Commits, using `commitlint.config.mjs`).

## Setup

From the repo root (after [Requirements](../README.md#requirements) are satisfied):

```bash
yarn install
yarn husky
```

Root `yarn install` is required so `husky`, `doctoc`, and other root `package.json` dependencies used by the hooks are on `PATH`.

## Skipping hooks

Use **`git commit --no-verify`** to skip hooks for a single commit when needed.
