# Comments feature: generic versus repo-grounded plan review

**Boundary:** this is a planning exercise only. Comments are not implemented in this release.

## Generic plan (what it sounded like without repository context)

1. Add a comments table with migrations and a user foreign key.
2. Add comment CRUD endpoints and authentication checks.
3. Create a React comment component with live updates.
4. Add broad tests and deploy the feature.

This plan is coherent in the abstract, but it assumes a database, users, React, authentication, migrations, and deployment infrastructure that this repository does not have.

## Repo-grounded plan

Files considered: `AGENTS.md`, `app/models.py`, `app/main.py`, `app/store.py`, `tests/test_tasks.py`, `frontend/index.html`, `frontend/app.js`, and `README.md`.

| Sequence | Plan | Tech-lead grade | Reason |
| --- | --- | --- | --- |
| 1 | Define a `Comment` response model and create/update input models using the project’s Pydantic v2 style. Use an integer ID to match task IDs, a `task_id`, an author limited to 1–100 characters, a body limited to 1–2000 characters, and a server-generated UTC `created_at`. | Right | It follows `TaskInput` validation and the in-memory numeric-ID convention instead of inventing UUIDs. |
| 2 | Decide whether comments remain embedded per task or are stored in a second in-memory dictionary. Ensure a comment cannot be created for a missing task. | Right | `TaskStore` is the actual persistence boundary; no database/migration plan is appropriate. |
| 3 | Add `GET /tasks/{task_id}/comments` and `POST /tasks/{task_id}/comments`, returning `404` when the task is absent and `201` when a comment is created. | Right | It matches the existing route and status-code style in `app/main.py`. |
| 4 | Add pytest cases for valid creation, nonexistent task, blank/too-long author and body, deterministic order, and task deletion behavior. | Missing | The base plan needs an explicit retention decision: deleting a task must either remove its comments or reject deletion, and the tests must prove that choice. |
| 5 | Add a comments section to each task card and a form that displays server `422` details. Escape author/body with the existing `escapeHtml` helper. | Right | `frontend/app.js` already uses server-driven CRUD and escaped interpolation. |
| 6 | Update API/README documentation and run the full suite. | Right | Documentation must describe the chosen deletion and ordering behavior. |

## What the grounded plan missed or needs resequencing

- **Needs resequencing:** decide comment deletion/retention semantics before writing storage or route tests.
- **Missing:** the project has no auth by scope, so the plan must state that `author` is a display field only; it is not a verified identity.
- **Missing:** add a maximum comments-per-task or rate-limit decision before treating the feature as production-ready, because the store is in memory.

## Comparison

The generic plan is acceptable for brainstorming labels and common concerns, but it would send a teammate into the wrong architecture here. The grounded plan is useful because it names `TaskStore`, Pydantic validation, existing route conventions, and the vanilla frontend. For correctness-sensitive planning, I will use targeted repository context first and then critique the plan rather than implementing it automatically.
