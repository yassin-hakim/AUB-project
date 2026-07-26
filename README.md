# Task Tracker — Mid-course Project

A small FastAPI and vanilla JavaScript Kanban task tracker. It retains the Module 1–3 behaviour (CRUD, priority-sorted board, status and priority filters) and adds exactly two scoped features:

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
