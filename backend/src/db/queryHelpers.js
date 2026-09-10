import { db } from './pool.js';

/**
 * Group-count rows in `table` by `column`, e.g. members per club.
 * Pass `ids` to scope the count to a known batch (e.g. comments for a page
 * of posts) instead of aggregating the entire table.
 */
export async function countByColumn(table, column, ids) {
  let query = db(table).select(column).count('* as count').groupBy(column);
  if (ids) {
    if (ids.length === 0) return new Map();
    query = query.whereIn(column, ids);
  }
  const rows = await query;
  return new Map(rows.map((r) => [r[column], Number(r.count)]));
}

/** Distinct values of `column` in `table` matching `where`, as a Set. */
export async function pluckSet(table, where, column) {
  const rows = await db(table).where(where).pluck(column);
  return new Set(rows);
}

/**
 * Toggles a join-table row: deletes it if a row matching `match` exists,
 * otherwise inserts one (merged with `insertExtra`, e.g. a default role).
 * Backs every "join/leave", "like/unlike", "register/unregister" action.
 */
export async function toggleRow(table, match, insertExtra = {}) {
  const existing = await db(table).where(match).first();
  if (existing) {
    await db(table).where(match).del();
    return false;
  }
  await db(table).insert({ ...match, ...insertExtra });
  return true;
}
