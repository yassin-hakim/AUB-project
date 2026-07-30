# Task Tracker architecture and context-strategy comparison

## System overview

The Task Tracker is a single FastAPI application that serves both a JSON task API and the vanilla JavaScript Kanban interface. It has no production authentication, database, real-time service, or external provider. Its state is deliberately process-local for the course project.

## Backend structure

`app/main.py` creates the FastAPI application, mounts `frontend/` at `/static`, returns the board at `/`, exposes `/health`, and provides list/create/get/update/delete task routes. `app/models.py` defines the `Status` and `Priority` enums plus Pydantic task input/output models; validation trims text and normalizes tags. `app/store.py` holds `TaskStore`, an in-memory dictionary, and enforces the allowed status transitions.

## Frontend structure

`frontend/index.html` provides the board, filters, and task dialog. `frontend/app.js` fetches relative `/tasks` routes, renders one column per status, escapes interpolated values, submits create/edit/delete requests, and patches a task during drag and drop. `frontend/tag-utils.js` keeps tag parsing testable and preserves blank comma-separated input for API validation.

## Data flow

1. A browser action gathers task input in `frontend/app.js` and sends JSON to a route in `app/main.py`.
2. FastAPI validates the body with `TaskCreate` or `TaskUpdate` in `app/models.py`; invalid input becomes a `422` response.
3. The route delegates to `TaskStore`. The store creates, retrieves, sorts, filters, updates, or deletes a task. Invalid status changes return a controlled `400`; missing tasks return `404` from the route.
4. The response model returns normalized task data, which the frontend escapes and renders in the appropriate board column.

## Testing and verification

`tests/test_tasks.py` checks health, CRUD, validation, filters, due dates, tags, sorting, and status transitions with FastAPI's test client. `tests/test_frontend.py` checks the special blank-tag browser parsing behavior. The release adds a Python 3.11 GitHub Actions workflow and a multi-stage, non-root Docker image; their reproducible checks are recorded in `ci-verification.md` and `docker-verification.md`.

## Known limits

Tasks disappear when the process restarts because `TaskStore` is in memory. There is no authentication, authorization, ownership, persistent storage, rate limiting, deployment configuration, or mobile client. These are learning-project scope decisions, not claims of production readiness.

## Strategy comparison log

| Question | A: minimal | B: structured | C: targeted |
| --- | --- | --- | --- |
| Most accurate file-level description | Low: guessed common stacks. | Medium: correct overview but light on details. | High: tied each behavior to inspected source. |
| Most invented/generic content | Highest: database, auth, and React assumptions. | Moderate: repetitive but mostly constrained. | Lowest: explicitly stated unknowns. |
| Most honest about unseen parts | Low. | Medium. | High. |
| Fastest useful output for a teammate | Only for a first conversation. | Good for onboarding. | Best for a review or implementation plan. |

**Context rule:** For a broad orientation task, use structured context plus `AGENTS.md`. For security review, behavior changes, or feature planning, start with targeted anchors—model, routes, storage, tests, and the affected frontend files—because accurate limits are more valuable than confident guesses.
