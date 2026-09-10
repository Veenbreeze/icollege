import { db } from '../db/pool.js';
import { countByColumn, pluckSet, toggleRow } from '../db/queryHelpers.js';

async function userSkillSet(userId) {
  const skills = await db('user_skills').where({ user_id: userId }).pluck('skill');
  return new Set(skills.map((s) => s.toLowerCase()));
}

function computeMatch(tags, skillSet) {
  if (!tags?.length) return 0;
  const hits = tags.filter((t) => skillSet.has(t.toLowerCase())).length;
  return Math.round((hits / tags.length) * 100);
}

function toPublicOpportunity(row, skillSet, savedSet, appliedSet) {
  return {
    id: `opp-${row.id}`,
    role: row.role,
    company: row.company,
    logo: row.logo_emoji,
    type: row.type,
    category: row.category,
    location: row.location,
    mode: row.mode,
    pay: row.pay,
    posted: row.posted_at,
    deadline: row.deadline ? new Date(row.deadline).toDateString() : null,
    tags: row.tags,
    matched: computeMatch(row.tags, skillSet),
    verified: row.verified,
    about: row.about,
    responsibilities: row.responsibilities,
    requirements: row.requirements,
    saved: savedSet.has(row.id),
    applied: appliedSet.has(row.id),
  };
}

export async function listOpportunities(userId, category) {
  const [skillSet, savedSet, appliedSet] = await Promise.all([
    userSkillSet(userId),
    pluckSet('opportunity_saves', { user_id: userId }, 'opportunity_id'),
    pluckSet('opportunity_applications', { user_id: userId }, 'opportunity_id'),
  ]);
  let query = db('opportunities').select('*');
  if (category && category !== 'All') query = query.where({ category });
  const rows = await query.orderBy('posted_at', 'desc');
  return rows.map((r) => toPublicOpportunity(r, skillSet, savedSet, appliedSet)).sort((a, b) => b.matched - a.matched);
}

export async function getOpportunity(id, userId) {
  const row = await db('opportunities').where({ id }).first();
  if (!row) return null;
  const [skillSet, savedSet, appliedSet] = await Promise.all([
    userSkillSet(userId),
    pluckSet('opportunity_saves', { user_id: userId }, 'opportunity_id'),
    pluckSet('opportunity_applications', { user_id: userId }, 'opportunity_id'),
  ]);
  return toPublicOpportunity(row, skillSet, savedSet, appliedSet);
}

export async function toggleSaveOpportunity(opportunityId, userId) {
  const saved = await toggleRow('opportunity_saves', { opportunity_id: opportunityId, user_id: userId });
  return { saved };
}

export async function applyToOpportunity(opportunityId, userId) {
  await db('opportunity_applications')
    .insert({ opportunity_id: opportunityId, user_id: userId })
    .onConflict(['user_id', 'opportunity_id'])
    .ignore();
  return { applied: true };
}

export async function listProjects(userId) {
  const rows = await db('projects').join('users', 'users.id', 'projects.owner_id').select('projects.*', 'users.full_name as owner_name');
  const [memberSet, countMap] = await Promise.all([
    pluckSet('project_members', { user_id: userId }, 'project_id'),
    countByColumn('project_members', 'project_id'),
  ]);

  return rows.map((r) => ({
    id: `project-${r.id}`,
    title: r.title,
    owner: r.owner_name,
    tagline: r.tagline,
    status: r.status,
    skills: r.skills,
    members: countMap.get(r.id) ?? 0,
    needed: r.needed_count,
    emoji: r.emoji,
    colorKey: r.color_key,
    joined: memberSet.has(r.id),
  }));
}

export async function toggleProjectMembership(projectId, userId) {
  const joined = await toggleRow('project_members', { project_id: projectId, user_id: userId }, { role: 'member' });
  return { joined };
}

export async function createProject(ownerId, { title, tagline, skills, neededCount, emoji, colorKey }) {
  const [row] = await db.transaction(async (trx) => {
    const inserted = await trx('projects').insert({
      owner_id: ownerId,
      title,
      tagline,
      skills: skills ?? [],
      needed_count: neededCount ?? 0,
      emoji: emoji || '🚀',
      color_key: colorKey || 'primary',
    }).returning('*');
    await trx('project_members').insert({ project_id: inserted[0].id, user_id: ownerId, role: 'owner' });
    return inserted;
  });

  const owner = await db('users').where({ id: ownerId }).first();
  return {
    id: `project-${row.id}`,
    title: row.title,
    owner: owner.full_name,
    tagline: row.tagline,
    status: row.status,
    skills: row.skills,
    members: 1,
    needed: row.needed_count,
    emoji: row.emoji,
    colorKey: row.color_key,
    joined: true,
  };
}

export async function getPortfolio(userId) {
  const user = await db('users').where({ id: userId }).first();
  const profile = await db('profiles').where({ user_id: userId }).first();
  const skills = await db('user_skills').where({ user_id: userId }).pluck('skill');
  const experience = await db('user_experience').where({ user_id: userId });
  const certifications = await db('user_certifications').where({ user_id: userId });
  const competitions = await db('user_competitions').where({ user_id: userId });
  const education = await db('user_education').where({ user_id: userId });

  const [{ count: projectCount }] = await db('project_members').where({ user_id: userId }).count('* as count');
  const [{ count: certCount }] = await db('user_certifications').where({ user_id: userId }).count('* as count');
  const [{ count: competitionCount }] = await db('user_competitions').where({ user_id: userId }).count('* as count');

  const ownedOrJoined = await db('project_members')
    .join('projects', 'projects.id', 'project_members.project_id')
    .where('project_members.user_id', userId)
    .select('projects.id', 'projects.title', 'projects.skills', 'projects.emoji', 'projects.color_key');

  return {
    fullName: user.full_name,
    headline: profile?.headline ?? '',
    location: profile?.location ?? '',
    successScore: user.success_score,
    open: profile?.open_to_opportunities ?? false,
    about: profile?.about ?? '',
    stats: [
      { label: 'Projects', value: String(Number(projectCount)) },
      { label: 'Certifications', value: String(Number(certCount)) },
      { label: 'Competitions', value: String(Number(competitionCount)) },
    ],
    skills,
    experience: experience.map((e) => ({ id: `exp-${e.id}`, role: e.role, org: e.org, period: e.period, desc: e.description, colorKey: e.color_key })),
    projectsList: ownedOrJoined.map((p) => ({ id: `project-${p.id}`, name: p.title, tag: (p.skills ?? []).slice(0, 2).join(' · '), emoji: p.emoji, colorKey: p.color_key })),
    certifications: certifications.map((c) => ({ id: `cert-${c.id}`, name: c.name, issuer: c.issuer, year: c.year, colorKey: c.color_key })),
    competitions: competitions.map((c) => ({ id: `comp-${c.id}`, name: c.name, result: c.result, year: c.year, colorKey: c.color_key })),
    education: education.map((e) => ({ id: `edu-${e.id}`, school: e.school, degree: e.degree, period: e.period, colorKey: e.color_key })),
  };
}
