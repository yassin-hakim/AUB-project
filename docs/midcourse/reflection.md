# Reflection

The main lesson was that a plausible-looking feature is not complete until its storage, validation, API behaviour, frontend state, and tests agree. Keeping the backend as the source of truth made the filter logic easier to reason about and prevented the browser from showing a state that could not be reproduced through the API.

The most useful AI contribution was fast scaffolding of small, bounded changes. It still needed review: tag normalization, explicit `null` handling for date clearing, completed-task treatment in overdue filtering, and user-visible error handling were all checked against the behaviour contract. Scope discipline mattered as much as implementation speed; notifications, database work, and bulk actions were intentionally left out.
