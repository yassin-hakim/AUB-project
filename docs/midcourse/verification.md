# Verification

## Baseline check: Modules 1–3 contract

Before accepting the mid-course features, the baseline behavior was checked against the following contract:

| Area | Required behavior | Automated evidence |
| --- | --- | --- |
| Health and CRUD | `/health`, create, get by ID, patch, delete, and 404 responses work. | `test_health_check`, create/get/patch/delete tests |
| Lists | `GET /tasks` filters by status and priority and sorts High, Medium, Low. | `test_list_filters_and_sorts_by_priority` |
| Workflow | Only `ToDo → InProgress`, `InProgress → Done`, and `Done → InProgress` are permitted. | allowed and disallowed transition tests |
| Board | Three visible `ToDo`, `InProgress`, and `Done` columns retain priority sorting and support drag/drop PATCH updates. | manual browser check below |

## Behavior contract before and after the feature extension

| Contract element | Before mid-course work | After mid-course work |
| --- | --- | --- |
| Existing task fields | id, title, description, status, priority, assignee | Preserved unchanged |
| Existing endpoints | health; task CRUD; status/priority list filters | Preserved; `GET /tasks/{id}` restored as part of the baseline contract |
| Status values and rules | Exact values `ToDo`, `InProgress`, `Done`; allowed-pair workflow | Preserved and API-enforced on PATCH |
| Board behavior | three Kanban columns, priority-sorted cards, create/edit/delete, drag/drop status updates | Preserved; cards add due-date and tag display |
| New fields | none | `due_date` and `tags` persist on the task resource |
| New list filters | status and priority | `tag` and `overdue` compose with the existing filters |

## Automated test evidence

Run from the repository root:

```bash
pytest -q
```

Recorded result after the final compliance fixes: **21 passed**. The suite retains baseline behavior coverage and includes these four focused mid-course feature tests:

1. creation with a due date and normalized tags;
2. overdue filtering with Done-task exclusion;
3. case-insensitive tag filtering;
4. PATCH clearing a due date and replacing tags.

It also verifies that blank tags are rejected with a `422` response and that the browser preserves blank comma-separated tag entries so the API can return that error. The browser implementation was manually checked to confirm a failed task load keeps the Kanban columns rendered and exposes a Retry action.

## Break Test evidence

These deliberate faults were applied temporarily, their targeted tests were run, and the correct implementation was restored immediately afterwards.

| Intentional fault | Targeted command | Expected failing assertion | Result |
| --- | --- | --- | --- |
| Change overdue comparison from `due_date < today` to `due_date <= today`. | `pytest -q tests/test_tasks.py::test_overdue_filter_excludes_done_tasks` | A task due today would be incorrectly returned as overdue. | Failed: actual titles were `Late task`, `Due today`; implementation restored to `<`. |
| Remove `task.status != Status.DONE` from the overdue predicate. | `pytest -q tests/test_tasks.py::test_overdue_filter_excludes_done_tasks` | A completed late task would incorrectly appear in the overdue list. | Failed: actual titles were `Late task`, `Finished late task`; exclusion restored. |

## Manual browser checks

1. Run `uvicorn app.main:app --reload` and open `http://127.0.0.1:8000`.
2. Confirm Ready state loads three visible columns; with no data, all columns remain visible and the page says no tasks match.
3. Create a task with a past due date and `Frontend, client, frontend`; confirm a red overdue label and exactly `#frontend` and `#client` tags.
4. Enable **Overdue only**, then combine Tag, Status, and Priority filters; confirm the board reflects the server-side intersection.
5. Drag a ToDo card into In Progress; confirm it moves. Drag it into Done; confirm the API error prevents the skipped transition. Move In Progress to Done, then reopen Done to In Progress; confirm both succeed.
6. Edit a task, clear its due date, and save; confirm it displays `No due date`.
7. Submit a blank title or a blank tag; confirm the form displays FastAPI's validation error rather than failing silently.
8. Temporarily stop the API or block the `/tasks` request; confirm the three columns remain visible and **Retry** reloads the board.
