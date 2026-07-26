# User stories

## Feature 1 — Due dates + overdue filter

**As a task owner, I want to give a task a due date and filter for overdue work, so I can act on missed incomplete tasks first.**

Acceptance criteria:

- The create/edit form accepts an optional calendar date.
- A task card displays its due date; incomplete past-due work is visibly marked overdue.
- `GET /tasks?overdue=true` returns only tasks with a past due date that are not `Done`.
- An overdue-only control is available in the frontend and combines with the existing status and priority filters.

## Feature 2 — Tags/labels

**As a task owner, I want to label tasks and filter by a label, so I can focus on a workstream without changing a task’s status.**

Acceptance criteria:

- The create/edit form accepts comma-separated tags.
- Tags are trimmed, lower-cased, deduplicated, limited to eight, and displayed on cards.
- `GET /tasks?tag=<tag>` matches a normalized tag.
- The frontend has a tag filter that combines with status, priority, and overdue filtering.
