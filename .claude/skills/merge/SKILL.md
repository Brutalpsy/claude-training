---
name: merge
description: Merge the current branch's PR, delete the branch (remote and local), and switch to master. Use when user says "merge it", "merge the PR", or "merge the branch".
---

When merging:

1. Find the open PR for the current branch: `gh pr view --json number,state`
2. Merge it: `gh pr merge <number> --merge`
3. Switch to master: `git checkout master`
4. Pull latest master: `git pull origin master`
5. Delete the remote branch: `git push origin --delete <branch-name>`
6. Delete the local branch: `git branch -d <branch-name>`

Report what was merged and confirm the branch was deleted.
