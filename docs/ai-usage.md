# AI usage rules for this repository

1. **Never paste sensitive material.** I will not paste `.env` files, credentials, API keys, tokens, session cookies, production logs, real customer names, personal data, or private incident details into an AI tool.
2. **Read before asking for a change.** For a repository claim or plan, I will open the relevant model, route, storage, test, and frontend files first. A response that cannot cite the files it used is a starting point, not evidence.
3. **Keep scopes small.** I will use one bounded task per thread and ask for a plan before a cross-cutting edit. During governance/review work, the default writable area is `docs/`.
4. **Inspect every accepted diff.** Before accepting a diff, I will check that it changes only the intended files and has not silently added a dependency, a deployment action, authentication, a database, or another out-of-scope feature.
5. **Always verify behavior.** I will run the narrowest relevant test or command after a change, and run the full `python -m pytest -v` suite before release. CI, Docker, and docs each need their own verification; passing application tests alone is not enough.
6. **Record AI contributions.** For AI-assisted code or release artifacts I keep, I will record the task/prompt intent, the accepted diff or decision, and the verification performed in the commit, PR, or a project document.
7. **Grade review output.** I will classify review comments as Useful, Noise, or Wrong and locate file evidence before acting. I will not treat confident wording as a security finding or a design approval.
