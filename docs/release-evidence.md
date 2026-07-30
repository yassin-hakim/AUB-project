# Release Evidence

## Baseline

- **Release branch:** `final-project` is the required submission branch. This scratch copy has no `.git` metadata, so branch publication must be confirmed in GitHub before submission.
- **Date checked:** 2026-07-30.
- **Local app run command:** `.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8017`.
- **`/health` result:** `curl --fail --silent http://127.0.0.1:8017/health` returned `{"status":"ok"}`.
- **Frontend check:** `curl --fail --silent http://127.0.0.1:8017/` returned HTTP 200. The served `frontend/index.html` contains the Kanban `#board`, the `New task` button, and the create/edit dialog; these are the same UI elements a teammate opens at `/`.
- **Test command:** `.venv/bin/python -m pytest -v`.
- **Test result:** 21 passed, 1 dependency deprecation warning, in 0.54 seconds.
- **JavaScript checks:** `node --check frontend/tag-utils.js` and `node --check frontend/app.js` both exited successfully.

## CI evidence

- **Workflow file:** [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).
- **Configured triggers:** `push` and `pull_request`.
- **Python version:** `3.11`, set explicitly with `actions/setup-python@v5`.
- **Test command used by CI:** `python -m pytest -v`, after `python -m pip install -r requirements.txt`.
- **Shortcut check:** no `continue-on-error`, `|| true`, skipped pytest command, or vague Python version appears in the workflow.
- **Latest GitHub Actions run:** not independently observable from this scratch workspace. Before submission, open the Actions tab for `final-project` and confirm its latest **Test** workflow is green; do not replace this note with a claim unless the run is actually observed.

## Docker evidence

- **Build command:** `docker build -t task-tracker .`
- **Run command:** `docker run --rm -d -p 8000:8000 --name task-tracker task-tracker`
- **Health command:** `curl http://127.0.0.1:8000/health` (expected `{"status":"ok"}`).
- **Non-root command:** `docker exec task-tracker whoami` (expected `app`).
- **Non-root safety check:** verified structurally: `Dockerfile` creates `app` and selects `USER app` before `CMD`.
- **No-baked-secrets check:** verified structurally: the runtime stage copies only `app/` and `frontend/`; [`.dockerignore`](../.dockerignore) excludes `.env`, `.env.*`, virtual environments, Git metadata, and uploads.
- **Execution status:** Docker is not installed in this workspace, so the image build/run and container `/health` response were not executed here. A Docker-enabled machine must run the four commands above and record the actual result before claiming this requirement as complete.

## Documentation claim-vs-reality log

| Claim checked | Evidence used | Result | Change made, if any |
| --- | --- | --- | --- |
| `GET /health` returns `{"status":"ok"}`. | `app/main.py::health` and the live curl result above. | Accurate. | Recorded the exact command and result in this file. |
| The API starts with `uvicorn app.main:app --reload`. | `app/main.py` exposes `app`; the live server used the same import path without reload. | Accurate. | README now gives the exact local command. |
| CI runs pytest on pushes and pull requests with Python 3.11. | `.github/workflows/ci.yml`. | Accurate by workflow inspection; remote result still needs GitHub confirmation. | README and this file link to the workflow and state the verification boundary. |
| Docker runs the app as a non-root user and exposes `/health`. | `Dockerfile` has `USER app`, `EXPOSE 8000`, and the Uvicorn command; `app/main.py::health` defines the endpoint. | Accurate by structural inspection; runtime execution remains unverified here. | README gives the exact build, run, curl, user-check, and cleanup commands. |
