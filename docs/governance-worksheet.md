# Governance worksheet

This worksheet records the Task Tracker material used with AI during the course and release review. Risk describes what was shared with the tool, not whether the tool was useful.

## What I shared

| Material shared with AI | Risk | Reason |
| --- | --- | --- |
| Task Tracker source structure and course-only code from `app/`, `frontend/`, and `tests/` | Low | The project contains synthetic tasks and no real accounts, customer records, or production configuration. |
| Test failures and validation messages for blank tags and status transitions | Low | The output is generated from local test data and does not contain credentials or personal data. |
| README, CI YAML, Dockerfile, and documentation drafts | Low | These are repository artifacts intended for a public course submission. |
| `.env` values, tokens, credentials, production logs, or real customer data | High — not shared | These categories must never be pasted into an AI tool or committed to this repository. |

## What I received

| AI-assisted output | What I accepted or adapted | What I still verified myself |
| --- | --- | --- |
| Suggestions for the FastAPI model, routes, and in-memory store | The project’s accepted behavior is represented in `app/models.py`, `app/main.py`, and `app/store.py`. | I checked status transitions, Pydantic limits, response codes, and the tests rather than trusting the suggestion. |
| Frontend validation and tag parsing ideas | The browser sends blank comma-separated tag segments to the API so the server owns validation. | I checked script load order in `frontend/index.html` and the regression test in `tests/test_frontend.py`. |
| CI and Docker drafts | The release uses a Python 3.11 test workflow and a two-stage non-root image. | I inspected workflow failure behavior, copied runtime files, and the `USER app` instruction. |
| Security and planning reports | These reports became starting points for review, not facts to accept. | I graded each security finding and compared generic planning assumptions with actual repository files. |

## Line-by-line trace: accepted tag validator

Selected block: `TaskInput.clean_tags` in `app/models.py`.

| Code line or group | What it does | Why it is needed / what breaks without it |
| --- | --- | --- |
| `cleaned: list[str] = []` | Starts a normalized result list. | There would be nowhere to collect safe, de-duplicated tags. |
| `for tag in tags:` | Handles every submitted tag rather than only the first. | Later tag values would bypass validation. |
| `tag = tag.strip().lower()` | Removes surrounding whitespace and standardizes case. | `Frontend`, ` frontend `, and `frontend` would behave as different filters. |
| `if not tag: raise ValueError(...)` | Rejects blank input after trimming. | Inputs such as `"   "` would become invisible/ambiguous tags. |
| `if len(tag) > 24: raise ValueError(...)` | Enforces the documented tag length limit. | A tag could exceed the API filter’s `max_length=24` and create inconsistent behavior. |
| `if tag not in cleaned: cleaned.append(tag)` | Preserves first occurrence and removes duplicates. | Duplicate tags would make responses noisier and less predictable. |
| `return cleaned` | Gives Pydantic the normalized list to store. | The model would retain the original, unvalidated list. |

I can explain each part of this block. The important boundary is that browser checks can improve the experience, but `app/models.py` remains the authority for submitted data.
