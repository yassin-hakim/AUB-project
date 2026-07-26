# Verification

## Behaviour checklist

- [x] The board uses `ToDo`, `InProgress`, and `Done` columns.
- [x] Cards use the backend response and remain priority-sorted.
- [x] Creating a task persists a due date and normalized tags.
- [x] Editing a task can replace tags or clear a due date.
- [x] The overdue filter excludes completed tasks, even when their due date is in the past.
- [x] Tag, status, priority, and overdue controls compose through API query parameters.
- [x] API errors are shown in the page/form rather than silently hidden.
- [x] Invalid data receives FastAPI validation feedback.

## Automated evidence

Run `pytest` from the repository root. The suite includes five focused tests, including the four new-feature cases:

1. creation with a due date and normalized tags;
2. overdue filtering and Done-task exclusion;
3. case-insensitive tag filtering;
4. PATCH clearing/replacing feature fields;
5. existing validation contract: blank title rejection.

## Manual browser checks

1. Start the server with `uvicorn app.main:app --reload` and open `/`.
2. Create a task with a past due date and tags such as `Frontend, client, frontend`; verify the red overdue label and two displayed tags.
3. Enable **Overdue only**; verify only incomplete late tasks remain.
4. Clear overdue, enter `frontend` in Tag, then apply status/priority filters; verify the board reflects their intersection.
5. Edit a task, clear the due date, save, and confirm `No due date` is displayed.
6. Submit a blank title and verify an in-form validation error instead of a silent failure.
