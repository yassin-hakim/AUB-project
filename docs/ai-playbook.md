# My AI playbook

## When I reach for AI first

I reach for AI first when I need a structured first pass across several connected files: mapping an API behavior to its test and frontend path, turning a rough requirement into acceptance criteria, or drafting a CI/Docker checklist. In this project, that was useful for spotting that tag behavior crosses `frontend/tag-utils.js`, `app/models.py`, and `tests/test_frontend.py`.

## When I do not reach for AI first

I do not start with AI when I have not read the relevant code, when the task involves secrets or real data, or when a small reproduction can answer the question faster. I will not ask an AI tool to guess production deployment, ownership, or database behavior from a course repository that deliberately does not include those things.

## My non-negotiables

- I never paste `.env` contents, passwords, API keys, tokens, session cookies, real customer data, personal data, or production logs.
- I read every changed file before accepting a diff; “looks right” is not a review.
- I run the smallest relevant test first and the full pytest suite before release.
- I keep governance/review tasks docs-first and reject unrelated application changes.

## My review rules

I ask the tool to cite files and then I open those files myself. I classify review feedback as Useful, Noise, or Wrong; I do not merge them into one vague “AI review” result. For CI and Docker, I inspect the commands and failure behavior—not just a green-looking YAML file or a successful image build.

## What I am still figuring out

I still need to learn the team rules for dependency updates, deployment credentials, and security ownership when this kind of learning project becomes a real service. The next time I add persistence or auth, I will decide the data-retention and ownership rules before asking an agent to generate routes.

## Decision Card

| Situation | My decision |
| --- | --- |
| New feature | Start with targeted repository context and a plan; read the model, routes, storage, tests, and affected UI before accepting implementation. |
| Code review | Use an AI review for broad coverage, then verify every useful-looking comment against the diff and run tests myself. |
| Debugging | Give the exact failing test and error output after removing sensitive data; reproduce locally before applying a suggested fix. |
| Infrastructure | Use AI to draft CI/Docker, but inspect version pins, copied files, runtime user, secrets handling, and a real failure path before accepting it. |
| Never paste | `.env` values, credentials, tokens, cookies, customer data, personal data, and production logs. |
| One rule | Evidence beats fluency: no generated answer is done until I can point to the relevant file and verification. |
