# Lessons — process

- **The repo was empty, so the session branch became the default branch** and no pull request
  could be opened. The `github-pages` environment then rejected deploys from that branch. Fix:
  `main` created from the same commit, made default by the owner, deploy pinned to `main`.
- **A billing lock stops Actions before any runner starts** ("account is locked due to a billing
  issue", job takes 2 s, no logs). Read the check-run annotations; the job log 404s.
- **Screenshots find what tests don't.** The invisible south-facing pointer and the all-fisherman
  daily crowd passed every test.
