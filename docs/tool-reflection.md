# Tool-fit reflection

For the feature work, an editor-oriented assistant was useful when the change was narrow: it could help locate the model, test, and frontend paths that all had to agree. For this release work, a repository-oriented workflow was more useful because CI, Docker, documentation, tests, and secret checks cross folder boundaries.

The most important difference was not speed. A generated Dockerfile or CI workflow can look finished while using the wrong Python version, running as root, or hiding test failures. I had to inspect the actual instructions, compare claims with `app/main.py`, `app/models.py`, and `app/store.py`, and keep the evidence separate from the generated text.

I would do this differently next time: create the release artifacts immediately after the core application stabilizes, then keep a short verification log as each artifact is added. That would avoid reconstructing evidence at the end and make the final security/governance review more concrete.
