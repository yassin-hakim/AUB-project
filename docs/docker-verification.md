# Docker verification record

## Security review of the image definition

| Requirement | File evidence | Expected verification |
| --- | --- | --- |
| Multi-stage build | `Dockerfile` has `builder` and `runtime` stages. | The final image does not need pip's build worktree. |
| Slim, explicit runtime | The runtime stage starts from `python:3.11-slim`. | `docker image inspect task-tracker` identifies the built image. |
| Non-root process | `adduser ... app` and `USER app` appear before `CMD`. | `docker exec task-tracker whoami` returns `app`. |
| No runtime secret copy | Only `app/` and `frontend/` are copied into the runtime stage. | Inspecting the container shows no `.env` copied by this Dockerfile. |
| Small build context | `.dockerignore` excludes `.env`, Git metadata, virtual environments, tests, caches, and uploads. | `docker build` should not send those files. |
| Health endpoint | `app/main.py::health` serves `/health`; the container exposes port 8000. | `curl http://127.0.0.1:8000/health` returns JSON status `ok`. |

## Commands to reproduce

```bash
docker build -t task-tracker .
docker run --rm -d -p 8000:8000 --name task-tracker task-tracker
curl http://127.0.0.1:8000/health
docker exec task-tracker whoami
docker stop task-tracker
```

Expected outputs are `{"status":"ok"}` and `app`. This record distinguishes Dockerfile inspection from a local Docker execution: the final check must be run in an environment with a Docker daemon before claiming a container run as evidence.
