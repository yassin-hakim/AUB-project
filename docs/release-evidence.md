# Release Evidence

## Baseline

- **Release branch:** `final-project` is the required submission branch.
- **Date checked:** 2026-07-31.
- **Local app run command:** `.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8017`.
- **`/health` result:** `curl --fail --silent http://127.0.0.1:8017/health` returned `{"status":"ok"}`.
- **Frontend check:** `curl --fail --silent http://127.0.0.1:8017/` returned HTTP 200. The served `frontend/index.html` contains the Kanban `#board`, the `New task` button, and the create/edit dialog.
- **Test command:** `.venv/bin/python -m pytest -v`.
- **Test result:** 21 passed, 1 dependency deprecation warning, in 0.85s (and 21 passed in Linux WSL).
- **JavaScript checks:** `node --check frontend/tag-utils.js` and `node --check frontend/app.js` both exited successfully.

## CI evidence

- **Workflow file:** [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).
- **Configured triggers:** `push` and `pull_request`.
- **Environment setup:** `actions/setup-node@v4` (Node.js 20) and `actions/setup-python@v5` (Python 3.11).
- **Test command used by CI:** `python -m pytest -v`, after `python -m pip install -r requirements.txt`.
- **Workflow fix:** Added `actions/setup-node@v4` step to `.github/workflows/ci.yml` to support `tests/test_frontend.py`, which executes `node` via `subprocess.run` to test browser tag parsing logic.
- **Remote CI Run Status:** Remote GitHub Actions API reports that runs fail prior to step execution with: `"The job was not started because your account is locked due to a billing issue."` All tests execute and pass 100% locally and in the Linux test environment.
- **Shortcut check:** No `continue-on-error`, `|| true`, skipped pytest command, or vague Python version appears in the workflow.

## Docker evidence (Executed & Verified)

- **Build command:** `docker build -t task-tracker .` (Executed on Docker daemon 29.1.3).
- **Build context fix:** `.dockerignore` originally had `*.txt`, which excluded `requirements.txt`. Added `!requirements.txt` to `.dockerignore` so Docker build receives the requirements file. Build output: `Successfully built 85db0084f99b`, tagged `task-tracker:latest`.
- **Run command:** `docker run --rm -d -p 8000:8000 --name task-tracker task-tracker`
- **Health command result:** `curl -i http://127.0.0.1:8000/health` returned `HTTP/1.1 200 OK` and body `{"status":"ok"}`.
- **Non-root command result:** `docker exec task-tracker whoami` returned `app`.
- **Non-root safety check:** `Dockerfile` creates `app` (`addgroup --system app && adduser --system --ingroup app app`) and selects `USER app` before `CMD`.
- **No-baked-secrets check:** Runtime stage copies only `app/` and `frontend/`; `.dockerignore` excludes `.env`, `.env.*`, virtual environments, Git metadata, and uploads.
- **Cleanup:** `docker stop task-tracker` executed successfully.

## Documentation claim-vs-reality log

| Claim checked | Evidence used | Result | Change made, if any |
| --- | --- | --- | --- |
| `GET /health` returns `{"status":"ok"}`. | `app/main.py::health` and live curl result. | Verified. | Recorded exact command and HTTP 200 response in this file. |
| The API starts with `uvicorn app.main:app --reload`. | `app/main.py` exposes `app`. | Verified. | README gives exact local command. |
| CI runs pytest on pushes and pull requests with Python 3.11 and Node 20. | `.github/workflows/ci.yml`. | Verified. | Added Node setup to workflow; noted GitHub account billing lock preventing remote runner dispatch. |
| Docker runs the app as non-root user `app` and exposes `/health`. | Container runtime execution: `docker run`, `curl http://127.0.0.1:8000/health` (HTTP 200 `{"status":"ok"}`), and `docker exec task-tracker whoami` (`app`). | Verified. | Fixed `.dockerignore` for `requirements.txt` and recorded exact executed output. |
