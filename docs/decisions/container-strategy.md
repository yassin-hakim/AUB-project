# Decision: multi-stage non-root container

## Context

The Task Tracker needs a repeatable way for a teammate to run the FastAPI API and static frontend without relying on a local virtual environment. The project is intentionally small: it has no database, no environment-variable requirement, and serves the frontend from the API process.

## Decision

Use a two-stage `python:3.11-slim` Dockerfile. The builder installs `requirements.txt` into `/opt/venv`; the runtime image copies that environment plus only `app/` and `frontend/`. The process runs as the system user `app` on port 8000.

## Alternatives considered

- **One-stage image:** shorter, but it leaves installation tooling and build work in the runtime layer.
- **Run as root:** simpler to write, but gives a compromised process more privilege than it needs.
- **Add Docker Compose and a database:** not justified because `app/store.py` deliberately uses in-memory storage and this release is not adding product infrastructure.

## Trade-offs

The image still includes the Python virtual environment, so it is not an aggressively minimal production image. It also cannot preserve tasks across a container restart because persistence is not part of this project. Those limits are honest reflections of the application rather than problems Docker should hide.

## Consequences

The documented `docker build`, `/health`, and `whoami` checks are enough to verify the intended runtime behavior. A later production version would need a persistence decision, dependency locking/scanning, and a deployment-specific health/readiness policy.

## Open questions

If the project gains a database, should the container run migrations at startup or should migration execution remain a separate deployment task? I would keep it separate unless the deployment environment makes that impractical.
