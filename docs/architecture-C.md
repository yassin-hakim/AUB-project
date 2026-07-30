# Architecture experiment C — targeted context

**Prompt condition:** the task was limited to `app/main.py`, `app/models.py`, `app/store.py`, `frontend/index.html`, `frontend/app.js`, and `tests/`.

## Output and critique

The targeted description was the most accurate at the behavior level. It identified the API routes in `app/main.py`, Pydantic boundaries in `app/models.py`, in-memory sorting and transition enforcement in `app/store.py`, relative frontend fetches in `frontend/app.js`, and test evidence under `tests/`.

It deliberately did not infer CI, Docker runtime behavior, external deployment, Git history, or real-user ownership because those were outside its anchors. That limitation is useful honesty rather than a defect.

## Lesson

For planning, review, or security tasks where a wrong claim is costly, selected anchor files produce the best evidence and the clearest boundary around what is not known.
