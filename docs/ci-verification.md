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

## Green → red → green proof procedure

The workflow is intentionally limited to tests, so its failure signal is pytest's exit code. On the submission branch, the evidence sequence should be recorded from GitHub Actions as follows:

1. Push the current project and retain the successful Actions run URL.
2. On a short-lived proof commit, change the expected health response in `tests/test_tasks.py::test_health_check` from `"ok"` to a deliberately incorrect value; run the named test locally and confirm a non-zero exit code; push and retain the failed run URL.
3. Restore the exact test assertion, run `python -m pytest -v`, push, and retain the restored successful run URL.

The intentional red commit must not remain in the final branch history unless the course specifically asks for that history. The final workflow has no failure-swallowing shortcut, and the local test evidence is recorded in [verification](midcourse/verification.md).
