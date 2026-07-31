# CI verification record

## Workflow inspection

I reviewed [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) before treating it as trustworthy.

| Check | Evidence | Result |
| --- | --- | --- |
| Runs for repository changes | `push` and `pull_request` are both workflow triggers. | Pass |
| Uses a stable runtime | `actions/setup-python@v5` pins Python to `3.11`; `actions/setup-node@v4` sets up Node 20. | Pass |
| Installs the project dependencies | The workflow runs `python -m pip install -r requirements.txt`. | Pass |
| Runs the real suite | The final step is `python -m pytest -v`. | Pass (21 passed) |
| Does not hide failures | There is no `continue-on-error`, `|| true`, or `--exit-zero`. | Pass |
| Has no deployment side effect | The only job checks out, installs, and tests. | Pass |

## Green → red → green proof & GitHub Actions execution status

1. **Local & Linux Suite execution:** `python -m pytest -v` passed all 21 tests cleanly in the verified Linux environment (with Node.js installed for `test_frontend.py`).
2. **Intentional red:** [`7833681`](https://github.com/yassin-hakim/AUB-project/commit/7833681bcb36653b3716cef1a355f4ce1f3be757) changed only `tests/test_tasks.py::test_health_check` to expect `{"status": "intentionally-wrong"}`. Because `app/main.py::health` returns `{"status": "ok"}`, pytest fails that assertion.
3. **Restored green:** [`622a7fa`](https://github.com/yassin-hakim/AUB-project/commit/622a7fa294a03a7d43e5214c09f88cc04f88764d) restored the exact assertion.
4. **CI Workflow Fix:** Added `actions/setup-node@v4` to `.github/workflows/ci.yml` so that `tests/test_frontend.py` (which uses Node.js via `subprocess.run` to test `frontend/tag-utils.js`) executes cleanly.
5. **GitHub Actions Remote Status Note:** GitHub Actions check-runs return the exact failure message: `"The job was not started because your account is locked due to a billing issue."` Once the GitHub account billing lock is resolved on GitHub.com, the workflow will run the verified test suite automatically.
