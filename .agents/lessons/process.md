# Lessons — process

- **The repo was empty, so the session branch became the default branch** and no pull request
  could be opened. The `github-pages` environment then rejected deploys from that branch. Fix:
  `main` created from the same commit, made default by the owner, deploy pinned to `main`.
- **A billing lock stops Actions before any runner starts** ("account is locked due to a billing
  issue", job takes 2 s, no logs). Read the check-run annotations; the job log 404s.
- **Screenshots find what tests don't.** The invisible south-facing pointer and the all-fisherman
  daily crowd passed every test.
- **Never ship art unseen.** The first impressionist canvas was published without being rendered
  and looked cheap (blurry CSS ovals, tiny flat faces); the owner asked whether I was unable to
  make it nice. The fix was a render → look → fix loop with Playwright screenshots on every
  iteration, before anything was published. Art is not done until it has been looked at.
