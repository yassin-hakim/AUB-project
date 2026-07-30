# Final AI Review and Ownership Evidence

## AGENTS.md guardrails

- **Repo-specific stack and commands included:** yes. [AGENTS.md](../AGENTS.md) names Python 3.11, FastAPI, the vanilla JavaScript board, and the supported run, test, Docker, health-check commands.
- **Docs-first/read-first guardrail included:** yes. The Module 5 guardrails require reading relevant files before claims and default this release work to `docs/` edits.
- **Unexpected `app/` or `frontend/` edits rule included:** yes. The guardrails require asking before broad application, frontend, or dependency changes.

## AI code review mini-log

Review scope: the release-hardening changes in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml), [`Dockerfile`](../Dockerfile), [`.dockerignore`](../.dockerignore), README, and `docs/`.

| AI comment | Grade: Useful / Noise / Wrong | Reason | Verification or decision |
| --- | --- | --- | --- |
| “Use `continue-on-error` so a test problem does not block CI.” | Wrong | A test workflow that hides test failures does not protect the release. | Rejected. The workflow runs `python -m pytest -v` with no failure-swallowing option. |
| “Use a non-root runtime user and copy only the application code into the runtime image.” | Useful | It reduces the process privileges and avoids copying unrelated local files. | Accepted after inspecting `Dockerfile`: it creates/selects `app` and copies only `app/` and `frontend/` into the runtime stage. |
| “Add authentication before releasing the project.” | Noise | Authentication is a real production concern but an out-of-scope product feature for this course release. | Not implemented; it is recorded as a backlog risk in `security-review.md`. |
| “Blank comma-separated tags are silently removed by the frontend.” | Useful | A non-empty tags field must preserve blank segments so the API can return the documented validation error. | Checked `frontend/tag-utils.js` and ran `tests/test_frontend.py::test_tag_field_preserves_blank_entries_for_api_validation`. |

## AI security mini-review

| Finding | File evidence | Grade: Valid / False Positive / Noise | Reason | Next action |
| --- | --- | --- | --- | --- |
| All task routes are unauthenticated. | `app/main.py` exposes task routes with no authentication dependency. | Valid | Any client that reaches this learning-project API can change its in-memory tasks. | Keep it out of this no-feature release; define users and authorization before any real deployment. |
| Task text and tags are unbounded, so one request can be arbitrarily large. | `app/models.py`. | False Positive | `title`, `description`, `assignee`, individual tags, and number of tags all have explicit limits. | No code change. |
| Docker runs as root and copies `.env` files into the image. | `Dockerfile`, `.dockerignore`. | False Positive | The runtime uses `USER app`, copies only `app/` and `frontend/`, and `.dockerignore` excludes `.env` and `.env.*`. | Run the documented Docker commands on a Docker-enabled machine before claiming runtime proof. |
| Dependency ranges can resolve differently in a future install. | `requirements.txt` uses compatible version ranges rather than a lock file. | Valid | This is a reproducibility concern, not a claim of a known vulnerable package. | Define a reviewed lock/constraints policy if the project becomes maintained beyond the course. |

## Manual security check

I independently ran a repository hygiene scan for `.env` and `*.log` files outside the local virtual environment; it found none. I also searched the release files for secret-like assignment names and reviewed every match: they were policy/documentation text or the comment-only `.env.example`, not a credential value. This matters because a good generated security review cannot prove what has not been checked in the actual working tree.

## One AI output I rejected or corrected

I rejected the suggestion to use `continue-on-error` for CI because it would allow a failing pytest suite to appear acceptable. I kept the workflow small instead: checkout, Python 3.11, dependency installation, and `python -m pytest -v`. I also corrected the broader claim that the frontend drops blank tags by reading `frontend/tag-utils.js` and running its focused regression test.

## Three AI usage rules

1. **Never paste:** `.env` values, credentials, tokens, cookies, production logs, customer data, or personal data.
2. **Always verify:** a cited file, the accepted diff, and the narrowest relevant command or test before treating an AI answer as evidence.
3. **Record AI contributions by:** writing the accepted decision, rejected suggestion, file evidence, and verification result in a commit, review note, or release document.

## Ownership statement

I am comfortable submitting this repository because I can explain the application scope, the CI commands, the Dockerfile choices, and every documented release claim. I reviewed the relevant source and configuration files rather than accepting AI wording on trust, then ran the complete test suite and live health check myself. I deliberately kept this release free of new product features and recorded the unresolved Docker-runtime verification boundary instead of claiming it passed. The remaining production risks, such as authentication and persistence, are documented as future work rather than being hidden by the course implementation.
