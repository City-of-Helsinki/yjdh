#!/usr/bin/env sh
# Refresh doctoc sections for staged README files (run from repository root).

set -eu

git diff --name-only --cached -- 'README.md' '**/README.md' |
	while IFS= read -r file || [ -n "$file" ]; do
		[ -z "$file" ] && continue
		yarn doctoc -u "$file"
		git add "$file"
	done
