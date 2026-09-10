/** Strips a route id's domain prefix, e.g. "exam-12" -> 12, "post-3" -> 3. */
export function numericId(prefixedId) {
  return Number(String(prefixedId).replace(/^[a-z]+-/, ''));
}
