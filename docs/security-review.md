# Security review

**Review boundary:** read-only review of the Task Tracker release. I inspected `AGENTS.md`, `app/main.py`, `app/models.py`, `app/store.py`, `frontend/index.html`, `frontend/app.js`, `requirements.txt`, `Dockerfile`, `.dockerignore`, `.github/workflows/ci.yml`, and the tests. This report records a learning-project threat model; it does not add product features.

## AI findings, graded by the project owner

| ID | Finding and file evidence | Risk in this repository | Grade | Why I gave this grade |
| --- | --- | --- | --- | --- |
| A1 | Every task route in `app/main.py` is unauthenticated. | Any user able to reach the app can read, create, edit, move, or delete tasks. | Valid | This is explicit in the code. It is an intentional course-scope decision, but would be a production risk. |
| A2 | `requirements.txt` uses compatible ranges rather than a lock file with exact resolved versions. | A future install can resolve different dependency releases. | Valid | This is a reproducibility and supply-chain-management gap, even though no known vulnerable package is claimed here. |
| A3 | Task text and tags are unbounded. | Large requests could exhaust memory. | False Positive | `app/models.py` limits title to 120, description to 1000, assignee to 80, tag to 24, and tags to eight. |
| A4 | Errors expose raw stack traces. | Internal implementation details could leak. | False Positive | `app/main.py` raises controlled `HTTPException`s for expected API errors and does not enable debug mode. Unexpected production-server settings are not visible, so no stronger claim is made. |
| A5 | The frontend inserts task text as raw HTML. | Stored script could execute in the board. | False Positive | `frontend/app.js::escapeHtml` escapes title, description, assignee, priority, due date, and tags before interpolation. |
| A6 | Docker runs as root and copies secrets into the image. | A compromised process could have excess privilege or read baked secrets. | False Positive | `Dockerfile` selects `USER app` and runtime copies only `app/` and `frontend/`; `.dockerignore` excludes `.env` and build-local files. |

## My manual findings

| ID | Finding | Evidence | Grade | Why it matters |
| --- | --- | --- | --- | --- |
| M1 | There is no request-rate control or maximum number of in-memory tasks. | `app/store.py::TaskStore.create` increments an in-memory dictionary without a quota; `app/main.py` exposes it publicly. | Valid | Repeated requests can consume memory in a long-running process. |
| M2 | The default UI/API relationship is same-origin, not broad CORS. | `app/main.py` does not add CORS middleware and `frontend/app.js` fetches relative `/tasks` paths. | Clean / no finding | This is safer than inventing a permissive-CORS finding. |
| M3 | No tracked secret or real data was found in the release files reviewed. | `.gitignore` ignores `.env` files and logs; `.env.example` contains only a comment; `.dockerignore` excludes `.env`; test data is synthetic. | Clean / no finding | This supports the submission hygiene check, but does not prove an unreviewed Git history is clean. |

## Reconciliation

| Agreement | AI-only | You-only |
| --- | --- | --- |
| Lack of authentication is a real production risk, while intentionally excluded from the course scope. | Dependency ranges reduce reproducibility; this is a useful release concern but not evidence of an active vulnerability. | Public, unbounded task creation is a separate availability risk that follows from the in-memory store and needs a quota/rate-limit decision. |
| Bounded Pydantic fields and frontend escaping prevent two generic findings from being valid here. | The claim about raw stack traces was too broad without a visible production server configuration. | The repository’s secret hygiene is clean in the reviewed files, but Git history and external deployment settings still require a separate check. |

## Top-3 backlog

| Rank | Finding | Why it matters | Owner | Next action |
| --- | --- | --- | --- | --- |
| 1 | Authentication and task ownership | The current API permits any reachable client to mutate all tasks. | Product/backend | Define users and ownership before any real deployment; add authorization tests with that design. |
| 2 | Availability controls | The in-memory public create endpoint has no quota or rate control. | Backend/operations | Choose a persistence and rate-limit strategy, then load-test the chosen limits. |
| 3 | Reproducible dependency management | Version ranges can change a future build. | Maintainer/DevOps | Introduce a reviewed lock/constraints workflow and dependency-update policy. |
