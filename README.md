# Task Tracker — Mid-course Project

A small FastAPI and vanilla JavaScript Kanban task tracker. It retains the Module 1–3 behaviour (health check, CRUD including get-by-ID, priority-sorted board, strict status-transition rules, status/priority filters, and drag-and-drop status updates) and adds exactly two scoped features:

1. **Due dates + overdue filter** — set a date on a task and show only incomplete overdue work.
2. **Tags/labels** — add up to eight normalized tags and filter the board by tag.

## Run

```bash
python -m venv .venv
. .venv/bin/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open `http://127.0.0.1:8000` for the board or `http://127.0.0.1:8000/docs` for the API.

## Test

```bash
pytest
```

The intended submission branch is `mid-course-project`.

## API behavior

- `GET /tasks` supports `status`, `priority`, `tag`, and `overdue=true` filters; filters compose.
- `GET /tasks/{id}`, `POST /tasks`, `PATCH /tasks/{id}`, and `DELETE /tasks/{id}` provide task CRUD.
- PATCH status changes permit only `ToDo → InProgress`, `InProgress → Done`, and `Done → InProgress`. Skipping a state, returning Done to ToDo, and no-op status updates return `400`.
- Due dates are optional. A task is overdue only when its due date is before today and it is not Done.

## Assignment documentation

The mid-course deliverables are in [`docs/midcourse`](docs/midcourse): user stories, mini ADR, prompt log, verification evidence, and reflection.
