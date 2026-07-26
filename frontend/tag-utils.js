function parseTags(rawTags) {
  // An empty field means the task has no tags. Any non-empty field preserves
  // empty comma-separated entries so the API can report a blank-tag error.
  if (rawTags === "") return [];
  return rawTags.split(",").map((tag) => tag.trim());
}

if (typeof module !== "undefined") {
  module.exports = { parseTags };
}
