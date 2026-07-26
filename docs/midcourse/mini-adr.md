# Mini ADR: store due dates and tags on the task resource

**Status:** Accepted

## Context

The existing application uses FastAPI, Pydantic models, in-memory storage, and a vanilla JavaScript frontend. The new information must remain available after any edit and drive API filters, so frontend-only state would violate the backend-as-source-of-truth constraint.

## Decision

Add `due_date: date | null` and `tags: list[str]` to the shared task models and in-memory record. Add optional `overdue` and `tag` query parameters to `GET /tasks`. The frontend sends these fields through existing POST/PATCH calls and reads filtering results only from `GET /tasks`.

Tags are lower-cased and deduplicated at validation time. A task is overdue when its due date is earlier than today and its status is not `Done`.

## Consequences

- Filtering rules are consistent for API clients and the browser.
- Completed tasks with historical due dates are not surfaced as overdue.
- `null` can explicitly clear an existing due date on PATCH.
- The implementation deliberately does not add authentication, databases, notifications, bulk operations, or other optional extensions.
