# Task Tracker

A small FastAPI and vanilla JavaScript Kanban task tracker. It retains the Module 1–3 behaviour (health check, CRUD including get-by-ID, priority-sorted board, strict status-transition rules, status/priority filters, and drag-and-drop status updates) and adds exactly two scoped features:

1. **Due dates + overdue filter** — set a date on a task and show only incomplete overdue work.
2. **Tags/labels** — add up to eight normalized tags and filter the board by tag.

## Local setup and run

```bash
python -m venv .venv
. .venv/bin/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open `http://127.0.0.1:8000` for the board or `http://127.0.0.1:8000/docs` for the API.

## Test

```bash
python -m pytest -v
```

## Container

The image uses a multi-stage Python 3.11-slim build and runs as the unprivileged `app` user.

```bash
docker build -t task-tracker .
docker run --rm -d -p 8000:8000 --name task-tracker task-tracker
curl http://127.0.0.1:8000/health
docker exec task-tracker whoami
docker stop task-tracker
```

The expected health response is `{"status":"ok"}` and the expected user is `app`.

## CI and conventions

GitHub Actions runs the full pytest suite on every push and pull request using Python 3.11; see [`.github/workflows/ci.yml`](.github/workflows/ci.yml). The project intentionally has no authentication, database, deployment configuration, or real user data. See [`AGENTS.md`](AGENTS.md) for the repository rules and safe AI-workflow guardrails.

## API behavior

- `GET /tasks` supports `status`, `priority`, `tag`, and `overdue=true` filters; filters compose.
- `GET /tasks/{id}`, `POST /tasks`, `PATCH /tasks/{id}`, and `DELETE /tasks/{id}` provide task CRUD.
- PATCH status changes permit only `ToDo → InProgress`, `InProgress → Done`, and `Done → InProgress`. Skipping a state, returning Done to ToDo, and no-op status updates return `400`.
- Due dates are optional. A task is overdue only when its due date is before today and it is not Done.
- Tags are trimmed, lower-cased, de-duplicated, limited to eight entries, and may not be blank. Invalid tag input returns `422`.
- If the board cannot load tasks, its three columns remain visible and the page provides a Retry action.

## Course evidence and release documentation

The mid-course deliverables are in [`docs/midcourse`](docs/midcourse). The final-release evidence is organized as follows:

- [CI verification](docs/ci-verification.md), [Docker verification](docs/docker-verification.md), [documentation reality log](docs/documentation-reality-log.md), and [review log](docs/code-review.md)
- [Container decision](docs/decisions/container-strategy.md) and [tool-fit reflection](docs/tool-reflection.md)
- [Security review](docs/security-review.md), [governance worksheet](docs/governance-worksheet.md), and [AI-usage rules](docs/ai-usage.md)
- [Comments-feature planning review](docs/decisions/comments-feature-plan.md), [context-strategy comparison](docs/architecture.md), and [personal AI playbook](docs/ai-playbook.md)
