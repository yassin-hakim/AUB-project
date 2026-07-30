# Task Tracker repository instructions

## Project summary

This is a learning-project Task Tracker: a Python 3.11 FastAPI API with an in-memory store and a vanilla JavaScript Kanban board. The API is served from `app/main.py`; the same app serves the UI from `frontend/`.

## Commands that are supported by this repository

```bash
python -m venv .venv
. .venv/bin/activate                 # Windows PowerShell: .venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
pytest -v
docker build -t task-tracker .
docker run --rm -p 8000:8000 --name task-tracker task-tracker
```

Check the running API with `curl http://127.0.0.1:8000/health`. The frontend is at `http://127.0.0.1:8000/` and API documentation is at `/docs`.

## Project rules

- Source folders are `app/` (FastAPI), `frontend/` (HTML/CSS/JavaScript), and `tests/` (pytest).
- The task store in `app/store.py` is intentionally in memory. Do not assume a database, migration system, login, or user ownership exists.
- Valid statuses are `ToDo`, `InProgress`, and `Done`. Only `ToDo → InProgress`, `InProgress → Done`, and `Done → InProgress` are valid status changes.
- Valid priorities are `High`, `Medium`, and `Low`; task lists sort in that order and then by ID.
- Titles are required and trimmed. Descriptions, assignees, due dates, and tags are optional. Tags are normalized to lowercase, must not be blank, have a 24-character maximum, and are limited to eight per task.
- Keep the frontend API contract aligned with `app/models.py` and `app/main.py`. Add or update focused tests for behavior changes.

## Module 5 guardrails

- This release is documentation, verification, review, and governance work—not a request for product features.
- Read the relevant repository files before making claims. Cite real paths and mark uncertainty instead of inventing behavior.
- Default to read-only analysis and edits under `docs/`. Ask before broad edits or changes in `app/`, `frontend/`, or dependency versions.
- Keep one bounded task per thread. Show and inspect diffs before accepting them; run the narrowest relevant verification.
- Never paste or commit secrets, credentials, tokens, `.env` values, production logs, real customer data, or personal data. Do not run destructive commands without explicit approval.
