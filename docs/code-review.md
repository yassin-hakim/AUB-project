# AI-assisted review log

## Review scope

I reviewed the release hardening diff: `AGENTS.md`, `.github/workflows/ci.yml`, `Dockerfile`, `.dockerignore`, README updates, and the documentation under `docs/`. I compared each proposed claim with the actual Task Tracker files, especially `app/main.py`, `app/models.py`, `app/store.py`, `frontend/index.html`, and `requirements.txt`.

| ID | Review comment | Classification | Evidence and disposition |
| --- | --- | --- | --- |
| R1 | “Use `continue-on-error` so documentation problems do not block CI.” | Wrong | CI must fail when pytest fails. `.github/workflows/ci.yml` deliberately omits failure-swallowing options. Rejected. |
| R2 | “Run the container as a non-root user and avoid copying the whole repository into the runtime image.” | Useful | `Dockerfile` creates `app`, selects `USER app`, and copies only `app/` and `frontend/` into the runtime stage. Accepted. |
| R3 | “Add authentication before release.” | Noise | `AGENTS.md` and README make clear that auth is intentionally outside this learning-project scope. It is recorded as a production backlog item in `security-review.md`, not implemented as an unrelated feature. |
| R4 | “The frontend's tag parser removes blank input.” | Useful | `frontend/tag-utils.js::parseTags` was checked. A non-empty input preserves empty comma-separated segments so the server can return the documented `422`; an entirely empty field means no tags. The claim is documented and covered by `tests/test_frontend.py`. |
| R5 | “The project uses persistent storage.” | Wrong | `app/store.py` uses an in-memory dictionary. The architecture and README state that clearly. Rejected. |

## My review rule

I will use an AI review as a broad first pass, but I will only accept a comment after locating the cited behavior in the repository and running the most relevant verification. A fluent recommendation is neither a test result nor a design decision.
