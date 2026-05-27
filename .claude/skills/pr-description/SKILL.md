---
name: pr-description
description: Writes pull request descriptions. Use when create a PR, writing a PR or when the user ask to summarize changes for a pull request.
model: claude-sonnet-4-6
---

When writing a PR description:

1. Run `git diff main..HEAD --name-only` to get the list of changed files
2. Run `git remote get-url origin` to get the repo URL, then derive the GitHub base URL (strip `.git`, convert SSH to HTTPS)
3. Run `git rev-parse --abbrev-ref HEAD` to get the current branch name
4. Run `git diff main..HEAD` to see all changes
5. Write a description following this format:

### What

One sentence explaining what this PR does.

## Why

Brief context on why this change is needed.

## Changes

- Bullet points on what was changed, with each file linked to its GitHub URL:
  `[src/path/to/file.ts](https://github.com/owner/repo/blob/branch-name/src/path/to/file.ts)`
- Group related changes together
- Mention any files deleted or renamed

## Testing

How to verify this works. Include specific commands if relevant.

6. After creating the PR with `gh pr create`, output the PR URL as a clickable markdown link:
   `[PR #N: <title>](<pr-url>)`

Keep descriptions concise and to the point. Focus on what a reviewer needs to know.
