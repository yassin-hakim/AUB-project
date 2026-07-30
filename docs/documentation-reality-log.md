# Documentation claim-versus-reality log

I checked the user-facing README claims against the implementation rather than copying generated wording into project documentation.

| Documentation claim | Code evidence checked | Result / correction |
| --- | --- | --- |
| The board is served at `/`. | `app/main.py::frontend` returns `frontend/index.html`; static files mount at `/static`. | Accurate. |
| `GET /health` returns JSON status `ok`. | `app/main.py::health` returns `{"status": "ok"}`. | Accurate. |
| Creating a task returns `201`. | `app/main.py::create_task` declares `status_code=201`. | Accurate. |
| Deleting a task returns `204` with no body. | `app/main.py::delete_task` declares `status_code=204` and returns `None`. | Accurate. |
| The application has a database. | `app/store.py::TaskStore` stores tasks in `self._tasks`, a Python dictionary. | Incorrect; README explicitly says the store is in memory. |
| Any status can be selected by drag and drop. | `app/store.py::ALLOWED_STATUS_TRANSITIONS` permits three transitions only. | Incorrect; README lists the exact permitted transitions. |
| Blank tags are ignored. | `app/models.py::TaskInput.clean_tags` raises on an empty normalized tag; `frontend/tag-utils.js::parseTags` preserves blanks from a non-empty input. | Incorrect; README says blank tags return `422`. |
| Overdue includes completed tasks. | `app/store.py::TaskStore.list` excludes `Status.DONE` in its overdue filter. | Incorrect; README says only incomplete past-due tasks are overdue. |

The final README links to the test, container, CI, project-rule, and course-evidence material it claims exists. The API documentation at `/docs` remains the generated source for request schemas and status-code details.
