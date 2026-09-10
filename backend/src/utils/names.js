/** "Daniel Mwakideu" -> "DM" */
export function initialsOf(fullName) {
  const parts = fullName.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}
