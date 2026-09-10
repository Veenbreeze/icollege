import { db } from '../db/pool.js';

async function ownedClub(clubId, ownerId) {
  return db('clubs').where({ id: clubId, owner_id: ownerId }).first();
}

export async function listMyClubs(ownerId) {
  return db('clubs').where({ owner_id: ownerId }).orderBy('name');
}

export async function updateClubProfile(clubId, ownerId, data) {
  const club = await ownedClub(clubId, ownerId);
  if (!club) return null;
  const patch = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.category !== undefined) patch.category = data.category;
  if (data.emoji !== undefined) patch.emoji = data.emoji;
  if (data.colorKey !== undefined) patch.color_key = data.colorKey;
  const [row] = await db('clubs').where({ id: clubId }).update(patch).returning('*');
  return row;
}

export async function listMembers(clubId, ownerId) {
  const club = await ownedClub(clubId, ownerId);
  if (!club) return null;
  return db('club_members')
    .join('users', 'users.id', 'club_members.user_id')
    .where('club_members.club_id', clubId)
    .select('users.id', 'users.full_name', 'users.student_id', 'users.email', 'club_members.joined_at');
}

export async function removeMember(clubId, ownerId, userId) {
  const club = await ownedClub(clubId, ownerId);
  if (!club) return false;
  const count = await db('club_members').where({ club_id: clubId, user_id: userId }).del();
  return count > 0;
}

export async function createEvent(clubId, ownerId, data) {
  const club = await ownedClub(clubId, ownerId);
  if (!club) return null;
  const [row] = await db('events').insert({
    club_id: clubId, title: data.title, host_name: club.name, type: data.type,
    event_date: data.eventDate, event_time: data.eventTime, venue: data.venue, emoji: data.emoji, color_key: data.colorKey,
  }).returning('*');
  return row;
}

export async function updateEvent(clubId, ownerId, eventId, data) {
  const club = await ownedClub(clubId, ownerId);
  if (!club) return null;
  const patch = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.type !== undefined) patch.type = data.type;
  if (data.eventDate !== undefined) patch.event_date = data.eventDate;
  if (data.eventTime !== undefined) patch.event_time = data.eventTime;
  if (data.venue !== undefined) patch.venue = data.venue;
  const [row] = await db('events').where({ id: eventId, club_id: clubId }).update(patch).returning('*');
  return row ?? null;
}

export async function deleteEvent(clubId, ownerId, eventId) {
  const club = await ownedClub(clubId, ownerId);
  if (!club) return false;
  const count = await db('events').where({ id: eventId, club_id: clubId }).del();
  return count > 0;
}

export async function createAnnouncement(clubId, ownerId, { title, body }) {
  const club = await ownedClub(clubId, ownerId);
  if (!club) return null;
  const [row] = await db('club_announcements').insert({ club_id: clubId, author_id: ownerId, title, body }).returning('*');
  return row;
}

export async function listAnnouncements(clubId) {
  return db('club_announcements').where({ club_id: clubId }).orderBy('created_at', 'desc');
}

export async function createCompetition(clubId, ownerId, data) {
  const club = await ownedClub(clubId, ownerId);
  if (!club) return null;
  const [row] = await db('competitions').insert({
    host_type: 'club', host_id: clubId, title: data.title, description: data.description,
    start_date: data.startDate, end_date: data.endDate, created_by: ownerId,
  }).returning('*');
  return row;
}
