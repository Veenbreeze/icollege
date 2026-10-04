import { db } from '../db/pool.js';
import { countByColumn, pluckSet, toggleRow } from '../db/queryHelpers.js';

export async function listClubs(user) {
  const clubs = await db('clubs').where('university_id', user.universityId).select('*').orderBy('name').limit(200);
  const [memberSet, countMap] = await Promise.all([
    pluckSet('club_members', { user_id: user.id }, 'club_id'),
    countByColumn('club_members', 'club_id', clubs.map((c) => c.id)),
  ]);

  return clubs.map((c) => ({
    id: `club-${c.id}`,
    name: c.name,
    category: c.category,
    emoji: c.emoji,
    colorKey: c.color_key,
    memberCount: countMap.get(c.id) ?? 0,
    joined: memberSet.has(c.id),
  }));
}

export async function toggleClubMembership(clubId, user) {
  if (!(await db('clubs').where({ id: clubId, university_id: user.universityId }).first('id'))) return null;
  const joined = await toggleRow('club_members', { club_id: clubId, user_id: user.id });
  return { joined };
}

export async function listEvents(user) {
  const events = await db('events').leftJoin('clubs', 'clubs.id', 'events.club_id').where('events.university_id', user.universityId)
    .andWhere('events.event_date', '>=', db.raw('CURRENT_DATE')).select('events.*', 'clubs.name as club_name').orderBy('events.event_date').limit(200);
  const [regSet, countMap] = await Promise.all([
    pluckSet('event_registrations', { user_id: user.id }, 'event_id'),
    countByColumn('event_registrations', 'event_id', events.map((e) => e.id)),
  ]);

  return events.map((e) => {
    const date = new Date(e.event_date);
    return {
      id: `event-${e.id}`,
      title: e.title,
      host: e.club_name ?? e.host_name,
      type: e.type,
      date: date.toDateString(),
      day: String(date.getDate()).padStart(2, '0'),
      month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
      time: e.event_time,
      venue: e.venue,
      attending: countMap.get(e.id) ?? 0,
      emoji: e.emoji,
      colorKey: e.color_key,
      registered: regSet.has(e.id),
    };
  });
}

export async function toggleEventRegistration(eventId, user) {
  if (!(await db('events').where({ id: eventId, university_id: user.universityId }).first('id'))) return null;
  const registered = await toggleRow('event_registrations', { event_id: eventId, user_id: user.id });
  return { registered };
}

export async function createEvent(user, { title, type, eventDate, eventTime, venue, emoji, colorKey, clubId }) {
  if (clubId && !(await db('clubs').where({ id: clubId, university_id: user.universityId }).first('id'))) return null;
  const account = await db('users').where({ id: user.id, university_id: user.universityId }).first();
  if (!account) return null;
  const [row] = await db('events').insert({
    university_id: user.universityId,
    club_id: clubId || null,
    title,
    host_name: account.full_name,
    type,
    event_date: eventDate,
    event_time: eventTime,
    venue,
    emoji: emoji || '📅',
    color_key: colorKey || 'blue',
  }).returning('*');
  await db('event_registrations').insert({ event_id: row.id, user_id: user.id }).onConflict(['event_id', 'user_id']).ignore();

  const date = new Date(row.event_date);
  return {
    id: `event-${row.id}`,
    title: row.title,
    host: row.host_name,
    type: row.type,
    date: date.toDateString(),
    day: String(date.getDate()).padStart(2, '0'),
    month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    time: row.event_time,
    venue: row.venue,
    attending: 1,
    emoji: row.emoji,
    colorKey: row.color_key,
    registered: true,
  };
}
