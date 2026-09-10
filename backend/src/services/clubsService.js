import { db } from '../db/pool.js';
import { countByColumn, pluckSet, toggleRow } from '../db/queryHelpers.js';

export async function listClubs(userId) {
  const clubs = await db('clubs').select('*').orderBy('name');
  const [memberSet, countMap] = await Promise.all([
    pluckSet('club_members', { user_id: userId }, 'club_id'),
    countByColumn('club_members', 'club_id'),
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

export async function toggleClubMembership(clubId, userId) {
  const joined = await toggleRow('club_members', { club_id: clubId, user_id: userId });
  return { joined };
}

export async function listEvents(userId) {
  const events = await db('events').leftJoin('clubs', 'clubs.id', 'events.club_id').select('events.*', 'clubs.name as club_name').orderBy('events.event_date');
  const [regSet, countMap] = await Promise.all([
    pluckSet('event_registrations', { user_id: userId }, 'event_id'),
    countByColumn('event_registrations', 'event_id'),
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

export async function toggleEventRegistration(eventId, userId) {
  const registered = await toggleRow('event_registrations', { event_id: eventId, user_id: userId });
  return { registered };
}

export async function createEvent(userId, { title, type, eventDate, eventTime, venue, emoji, colorKey, clubId }) {
  const user = await db('users').where({ id: userId }).first();
  const [row] = await db('events').insert({
    club_id: clubId || null,
    title,
    host_name: user.full_name,
    type,
    event_date: eventDate,
    event_time: eventTime,
    venue,
    emoji: emoji || '📅',
    color_key: colorKey || 'blue',
  }).returning('*');
  await db('event_registrations').insert({ event_id: row.id, user_id: userId }).onConflict(['event_id', 'user_id']).ignore();

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
