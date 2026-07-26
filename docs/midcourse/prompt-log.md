# Prompt log

This project used AI as a constrained implementation assistant. The code and behaviour were inspected and verified before acceptance.

| Step | Prompt / task | Output decision | Evidence |
| --- | --- | --- | --- |
| Plan | “Propose two small, end-to-end features for the existing FastAPI Task Tracker. Keep the backend source of truth and use vanilla JS.” | Accepted: due dates + overdue filter and tags/labels. | Both features fit the permitted list and have API, UI, and test scope. |
| Model | “Extend task models so due dates can be cleared and tags are validated.” | Edited before acceptance. | Explicit `null` PATCH semantics and lower-case deduplication were retained; blank titles are rejected. |
| API | “Add overdue and tag filtering without changing existing status and priority filtering.” | Accepted after inspection. | The filters compose in `TaskStore.list`; completed tasks are excluded from overdue results. |
| UI | “Add form controls and filters while preserving the three-column priority-sorted board.” | Edited before acceptance. | Added error-state handling and HTML escaping; filtering always reloads the server result. |
| Rejected output | “Implement reminder notifications or a production database.” | Rejected. | Both are outside the project scope and would make the feature set larger than the assignment requires. |
