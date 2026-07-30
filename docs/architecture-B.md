# Architecture experiment B — structured context

**Prompt condition:** the task included the repository purpose, `AGENTS.md`, and a concise summary of the backend, frontend, test, Docker, and CI folders.

## Output and critique

This strategy correctly described FastAPI, Pydantic models, the vanilla JavaScript Kanban board, pytest, Docker, and GitHub Actions. It also correctly stated that the project intentionally does not include auth or a production database.

The structured context improved completeness, but it encouraged a long narrative that repeated setup information. It was less precise than direct source reading about the exact allowed status transitions, the distinction between an empty tag field and a blank comma-separated tag, and how overdue filtering excludes completed tasks.

## Lesson

Structured context is good for a broad onboarding overview. Before making a behavior-specific claim, it still needs an anchor in the actual source or tests.
