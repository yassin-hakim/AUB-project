# User stories

## Feature 1 — Due dates and overdue filtering

### Story 1: set a due date

**As a task owner, I want to give a task an optional due date so I can see when the work is expected.**

Acceptance criteria:

- The create and edit form provides an optional calendar-date field.
- `POST /tasks` and `PATCH /tasks/{id}` accept an ISO date or `null`.
- Cards show either the stored date or `No due date`.

### Story 2: identify late work

**As a task owner, I want incomplete work with a past due date to be visibly marked overdue so I can prioritize it.**

Acceptance criteria:

- A task is overdue only when its due date is before the current date and its status is not `Done`.
- An overdue card uses a visible overdue label.
- Done tasks with a historical due date are not labelled overdue.

### Story 3: focus on overdue work

**As a task owner, I want an overdue-only filter so I can view missed work without hiding the Kanban columns.**

Acceptance criteria:

- `GET /tasks?overdue=true` returns only overdue tasks.
- The frontend sends the filter to the API; it does not calculate a separate client-only result.
- Overdue filtering composes with status, priority, and tag filters.

### Corrected AI assumption

The first AI suggestion treated every past date as overdue. That was corrected: a completed task stays historically dated but is not overdue, because the feature is meant to identify incomplete work requiring action.

## Feature 2 — Tags and labels

### Story 1: label a task

**As a task owner, I want to add labels to a task so I can identify its workstream.**

Acceptance criteria:

- The create and edit form accepts comma-separated tags.
- The API stores up to eight tags per task.
- Stored tags are rendered on the corresponding card.

### Story 2: keep labels consistent

**As a task owner, I want labels normalized so equivalent labels do not split the same workstream.**

Acceptance criteria:

- Tags are trimmed and lower-cased before storage.
- Duplicate normalized tags are kept once, in their first-entered order.
- A tag over 24 characters is rejected with FastAPI validation feedback.

### Story 3: filter by label

**As a task owner, I want to filter by a label so I can view one workstream while retaining its Kanban status.**

Acceptance criteria:

- `GET /tasks?tag=<tag>` matches normalized tag values case-insensitively.
- The tag field in the frontend reloads the server-filtered board.
- Tag filtering composes with status, priority, and overdue filters.

### Corrected AI assumption

An early AI output proposed storing tags only in browser state and filtering the rendered cards locally. That was rejected because a refreshed page and any API client would lose the same behavior. Tags and filtering therefore live in the task model and API store.
