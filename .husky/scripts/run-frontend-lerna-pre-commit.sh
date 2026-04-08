#!/usr/bin/env sh
# If the commit touches frontend/, run Lerna pre-commit in each workspace package (lint-staged, etc.).
# Run from repository root.

set -eu

if git diff --name-only --cached | grep -q -e 'frontend/'; then
	(cd frontend && yarn husky:pre-commit)
fi
