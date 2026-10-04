import { db } from '../db/pool.js';

async function ownedClub(clubId, user) {
  return db('clubs').where({ id: clubId, owner_id: user.id, university_id: user.universityId }).first();
}

export async function listMyClubs(user) {
  return db('clubs').where({ owner_id: user.id, university_id: user.universityId }).orderBy('name');
}

export async function updateClubProfile(clubId, user, data) {
  const club = await ownedClub(clubId, user);
  if (!club) return null;
  const patch = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.category !== undefined) patch.category = data.category;
  if (data.emoji !== undefined) patch.emoji = data.emoji;
  if (data.colorKey !== undefined) patch.color_key = data.colorKey;
  const [row] = await db('clubs').where({ id: clubId, university_id: user.universityId }).update(patch).returning('*');
  return row;
}

export async function listMembers(clubId, user) {
  const club = await ownedClub(clubId, user);
  if (!club) return null;
  return db('club_members')
    .join('users', 'users.id', 'club_members.user_id')
    .where('club_members.club_id', clubId)
    .andWhere('users.university_id', user.universityId)
    .select('users.id', 'users.full_name', 'users.student_id', 'users.email', 'club_members.joined_at');
}

export async function removeMember(clubId, user, userId) {
  const club = await ownedClub(clubId, user);
  if (!club) return false;
  const validMember = await db('users').where({ id: userId, university_id: user.universityId }).first('id');
  if (!validMember) return false;
  const count = await db('club_members').where({ club_id: clubId, user_id: userId }).del();
  return count > 0;
}

export async function createEvent(clubId, user, data) {
  const club = await ownedClub(clubId, user);
  if (!club) return null;
  const [row] = await db('events').insert({
    university_id: user.universityId, club_id: clubId, title: data.title, host_name: club.name, type: data.type,
    event_date: data.eventDate, event_time: data.eventTime, venue: data.venue, emoji: data.emoji, color_key: data.colorKey,
  }).returning('*');
  return row;
}

export async function updateEvent(clubId, user, eventId, data) {
  const club = await ownedClub(clubId, user);
  if (!club) return null;
  const patch = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.type !== undefined) patch.type = data.type;
  if (data.eventDate !== undefined) patch.event_date = data.eventDate;
  if (data.eventTime !== undefined) patch.event_time = data.eventTime;
  if (data.venue !== undefined) patch.venue = data.venue;
  const [row] = await db('events').where({ id: eventId, club_id: clubId, university_id: user.universityId }).update(patch).returning('*');
  return row ?? null;
}

export async function deleteEvent(clubId, user, eventId) {
  const club = await ownedClub(clubId, user);
  if (!club) return false;
  const count = await db('events').where({ id: eventId, club_id: clubId, university_id: user.universityId }).del();
  return count > 0;
}

export async function createAnnouncement(clubId, user, { title, body }) {
  const club = await ownedClub(clubId, user);
  if (!club) return null;
  const [row] = await db('club_announcements').insert({ club_id: clubId, author_id: user.id, title, body }).returning('*');
  return row;
}

export async function listAnnouncements(clubId, user) {
  if (!(await ownedClub(clubId, user))) return null;
  return db('club_announcements').where({ club_id: clubId }).orderBy('created_at', 'desc');
}

export async function createCompetition(clubId, user, data) {
  const club = await ownedClub(clubId, user);
  if (!club) return null;
  const [row] = await db('competitions').insert({
    host_type: 'club', host_id: clubId, title: data.title, description: data.description,
    start_date: data.startDate, end_date: data.endDate, created_by: user.id,
  }).returning('*');
  return row;
}
