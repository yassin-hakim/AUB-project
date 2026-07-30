# Architecture experiment A — minimal context

**Prompt condition:** “Write a one-page architecture description for a Task Tracker.” No repository files were supplied as context.

## Output and critique

The minimal-context description correctly anticipated a browser UI, an API, task CRUD, and tests. It also made several unsupported assumptions: a relational database, user accounts, authentication, a modern frontend framework, and deployment infrastructure.

That output is useful only as a high-level checklist. It is too generic to onboard a teammate because it could describe many task applications and does not identify this project’s real storage, validation, transition rules, or static-file arrangement.

## Lesson

Minimal context is quick for brainstorming, but it has the highest risk of filling gaps with familiar architecture patterns. It should not be used alone for a security review, implementation plan, or project documentation.
