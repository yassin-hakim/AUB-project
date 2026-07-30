# CI verification record

## Workflow inspection

I reviewed [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) before treating it as trustworthy.

| Check | Evidence | Result |
| --- | --- | --- |
| Runs for repository changes | `push` and `pull_request` are both workflow triggers. | Pass |
| Uses a stable runtime | `actions/setup-python@v5` pins Python to `3.11`. | Pass |
| Installs the project dependencies | The workflow runs `python -m pip install -r requirements.txt`. | Pass |
| Runs the real suite | The final step is `python -m pytest -v`. | Pass |
| Does not hide failures | There is no `continue-on-error`, `|| true`, or `--exit-zero`. | Pass |
| Has no deployment side effect | The only job checks out, installs, and tests. | Pass |

## Green → red → green proof

The workflow is intentionally limited to tests, so its failure signal is pytest's exit code. The final branch has a deliberately failing proof commit followed by an exact restoration:

1. **Green baseline:** `python -m pytest -v` passed all 21 tests locally before the branch update.
2. **Intentional red:** [`7833681`](https://github.com/yassin-hakim/AUB-project/commit/7833681bcb36653b3716cef1a355f4ce1f3be757) changed only `tests/test_tasks.py::test_health_check` to expect `{"status": "intentionally-wrong"}`. Because `app/main.py::health` returns `{"status": "ok"}`, pytest must fail that assertion; this is the expected red CI condition.
3. **Restored green:** [`622a7fa`](https://github.com/yassin-hakim/AUB-project/commit/622a7fa294a03a7d43e5214c09f88cc04f88764d) restored the exact assertion. The local full suite passed again after the restoration.

The connector used to publish the repository does not expose push-triggered Actions logs, so this document does not fabricate a remote check URL or conclusion. The public repository preserves both proof commits, and GitHub Actions runs the inspected workflow on each push. The final workflow has no failure-swallowing shortcut; the restored source is the tested final state.
