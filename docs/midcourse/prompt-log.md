# Prompt log

AI was used as a bounded implementation assistant. Every suggestion was checked against the assignment scope, API contract, and tests before it was accepted.

## Feature 1 — Due dates and overdue filtering

| # | Prompt / task | Decision and evidence |
| --- | --- | --- |
| 1 | “Extend the existing Pydantic task model with an optional ISO due date. Preserve all current fields and make PATCH capable of explicitly clearing the date.” | Accepted after review. `due_date: date | None` is shared by create, update, storage, and response models; the PATCH test proves `null` clears it. |
| 2 | “Define overdue precisely for a task tracker and add an API filter that composes with status and priority.” | Edited before acceptance. The output originally included completed tasks; the accepted contract is `due_date < today` and `status != Done`, exercised by `test_overdue_filter_excludes_done_tasks`. |
| 3 | “Add a date control and overdue-only control to the existing vanilla-JS Kanban board, with loading, empty, and error states.” | Accepted after browser review. The controls build `GET /tasks` query parameters and the board retains all three columns. |

## Feature 2 — Tags and labels

| # | Prompt / task | Decision and evidence |
| --- | --- | --- |
| 1 | “Add a list of tags to the Task Tracker model with trimming, lower-casing, de-duplication, a maximum of eight tags, and a 24-character tag limit.” | Accepted after review. The validator preserves first occurrence order; the creation test proves normalized de-duplication. |
| 2 | “Implement a case-insensitive tag filter in `GET /tasks` that combines with all existing filters.” | Accepted after review. Filter composition remains in `TaskStore.list`, and `test_tag_filter_returns_only_matching_tasks` covers case-insensitive matching. |
| 3 | “Add a comma-separated tags field to create/edit and display safe tag chips on task cards. Keep the backend as the source of truth.” | Accepted after review. The form sends tags through POST/PATCH, and rendering escapes tag text. |

## Weak prompt rewritten stronger

| Version | Prompt | Why it was used or rejected |
| --- | --- | --- |
| Weak | “Add tags and dates.” | Rejected: it does not define storage, validation, API behavior, UI scope, or compatibility constraints. |
| Stronger | “Extend the existing FastAPI Task Tracker—without changing its status values, priority sorting, CRUD contract, or vanilla-JS architecture—with (1) optional due dates and `GET /tasks?overdue=true` excluding Done tasks, and (2) normalized tags plus `GET /tasks?tag=`. Persist both fields server-side, expose them in create/edit UI, add at least four focused pytest tests, and do not add authentication, a database, notifications, or unrelated features.” | Used as the implementation boundary. It made the expected behavior testable and prevented scope expansion. |

## Rejected out-of-scope suggestion

“Add reminder notifications and a production database” was rejected. Neither is required by the selected features, and both would violate the deliberately constrained mid-course scope.
