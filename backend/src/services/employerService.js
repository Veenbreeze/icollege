import { db } from '../db/pool.js';

async function myCompany(userId) {
  const user = await db('users').where({ id: userId }).first();
  if (!user?.company_id) return null;
  return db('companies').where({ id: user.company_id }).first();
}

export async function getMyCompany(userId) {
  return myCompany(userId);
}

export async function updateMyCompany(userId, data) {
  const company = await myCompany(userId);
  if (!company) return null;
  const patch = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.description !== undefined) patch.description = data.description;
  if (data.website !== undefined) patch.website = data.website;
  if (data.logoUrl !== undefined) patch.logo_url = data.logoUrl;
  const [row] = await db('companies').where({ id: company.id }).update(patch).returning('*');
  return row;
}

export async function createOpportunity(userId, data) {
  const company = await myCompany(userId);
  const [row] = await db('opportunities').insert({
    role: data.role,
    company: company?.name ?? data.company,
    logo_emoji: data.logoEmoji,
    type: data.type,
    category: data.category,
    location: data.location,
    mode: data.mode,
    pay: data.pay,
    deadline: data.deadline,
    tags: data.tags ?? [],
    about: data.about,
    responsibilities: data.responsibilities ?? [],
    requirements: data.requirements ?? [],
    verified: false,
    posted_by: userId,
    company_id: company?.id ?? null,
  }).returning('*');
  return row;
}

export async function listMyOpportunities(userId) {
  return db('opportunities').where({ posted_by: userId }).orderBy('posted_at', 'desc');
}

export async function listApplicants(userId, opportunityId) {
  const opportunity = await db('opportunities').where({ id: opportunityId, posted_by: userId }).first();
  if (!opportunity) return null;
  return db('opportunity_applications')
    .join('users', 'users.id', 'opportunity_applications.user_id')
    .leftJoin('profiles', 'profiles.user_id', 'users.id')
    .where('opportunity_applications.opportunity_id', opportunityId)
    .select('users.id', 'users.full_name', 'users.email', 'users.programme', 'users.year', 'profiles.headline', 'opportunity_applications.applied_at');
}

export async function createChallenge(userId, data) {
  const company = await myCompany(userId);
  if (!company) return null;
  const [row] = await db('competitions').insert({
    host_type: 'employer', host_id: company.id, title: data.title, description: data.description,
    start_date: data.startDate, end_date: data.endDate, created_by: userId,
  }).returning('*');
  return row;
}

export async function searchTalent({ skill, programme } = {}) {
  let query = db('profiles')
    .join('users', 'users.id', 'profiles.user_id')
    .where('profiles.open_to_opportunities', true)
    .andWhere('users.role', 'student')
    .select('users.id', 'users.full_name', 'users.programme', 'users.year', 'profiles.headline', 'profiles.location');

  if (programme) query = query.andWhere('users.programme', 'ilike', `%${programme}%`);

  let rows = await query;

  if (skill) {
    const matches = await db('user_skills').where('skill', 'ilike', `%${skill}%`).pluck('user_id');
    const matchSet = new Set(matches);
    rows = rows.filter((r) => matchSet.has(r.id));
  }

  return rows;
}
