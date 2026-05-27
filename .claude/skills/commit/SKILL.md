---
name: commit
description: Stage changes, generate a commit message summarizing what was done, create a branch if needed, and commit. Use when user says "commit", "commit changes", "commit this", or "commit it".
---

When committing:

1. Check current state: `git status --short` and `git diff --cached` to see staged changes, plus `git diff` for unstaged
2. If there are unstaged changes the user likely wants committed, stage the relevant files (exclude screenshots, logs, .playwright-mcp/, response.txt, and other artifacts)
3. If on master, create a descriptive kebab-case branch name based on the changes (e.g. `fix-auth-redirect`, `add-user-avatar`, `update-nav-styles`) and check it out
4. Analyze the diff and write a concise commit message:
   - First line: imperative mood, max 72 chars (e.g. "Add retry logic to API client")
   - Summarize WHAT changed and WHY if non-obvious
   - No need to list every file — focus on the intent
5. Commit with:
```
git commit -m "$(cat <<'EOF'
<message here>
EOF
)"
```

Report the branch name, commit hash, and the commit message used.
