import { db } from '../db/pool.js';
import { countByColumn } from '../db/queryHelpers.js';

const STOPWORDS = new Set(['find', 'the', 'a', 'an', 'for', 'in', 'on', 'me', 'to', 'of', 'and', 'who', 'closing', 'this', 'month', 'students']);

function keywords(query) {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/**
 * One entry per searchable domain — add a new table here rather than
 * hand-writing another near-identical ILIKE block.
 */
const SEARCH_DOMAINS = [
  {
    label: 'Notices', table: 'notices', columns: ['title', 'body'],
    map: (n) => ({ id: `notice-${n.id}`, title: n.title, subtitle: n.category, category: 'Notice', icon: n.icon, colorKey: n.color_key, route: '/notices' }),
  },
  {
    label: 'Opportunities', table: 'opportunities', columns: ['role', 'company', 'category', 'type'], arrayColumns: ['tags'],
    map: (o) => ({ id: `opp-${o.id}`, title: o.role, subtitle: `${o.company} · ${o.type}`, category: 'Opportunity', icon: 'briefcase', colorKey: 'green', route: `/opportunity/opp-${o.id}` }),
  },
  {
    label: 'Documents', table: 'documents', columns: ['name'], scopeToUser: true,
    map: (d) => ({ id: `doc-${d.id}`, title: d.name, subtitle: d.category, category: 'Document', icon: 'document-text', colorKey: 'primary', route: '/documents' }),
  },
  {
    label: 'Clubs', table: 'clubs', columns: ['name', 'category'],
    map: (c) => ({ id: `club-${c.id}`, title: c.name, subtitle: c.category, category: 'Club', icon: 'people', colorKey: c.color_key, route: '/clubs' }),
  },
  {
    label: 'Events', table: 'events', columns: ['title', 'type'],
    map: (e) => ({ id: `event-${e.id}`, title: e.title, subtitle: new Date(e.event_date).toDateString(), category: 'Event', icon: 'calendar', colorKey: e.color_key, route: '/clubs' }),
  },
  {
    label: 'Projects', table: 'projects', columns: ['title'], arrayColumns: ['skills'],
    map: (p) => ({ id: `project-${p.id}`, title: p.title, subtitle: `Project · ${p.status}`, category: 'Project', icon: 'construct', colorKey: p.color_key, route: '/career' }),
  },
];

async function searchDomain(domain, userId, words) {
  let query = db(domain.table);
  if (domain.scopeToUser) query = query.where({ user_id: userId });

  query = query
    .where((qb) => {
      words.forEach((w) => {
        (domain.columns ?? []).forEach((col) => qb.orWhereILike(col, `%${w}%`));
        (domain.arrayColumns ?? []).forEach((col) =>
          qb.orWhereRaw(`EXISTS (SELECT 1 FROM unnest(${col}) t WHERE t ILIKE ?)`, [`%${w}%`]),
        );
      });
    })
    .limit(5);

  return query;
}

export async function search(userId, query) {
  const words = keywords(query);
  if (words.length === 0) return { interpretation: 'No search terms recognized', results: [] };

  const results = [];
  const matchedLabels = new Set();

  for (const domain of SEARCH_DOMAINS) {
    const rows = await searchDomain(domain, userId, words);
    if (rows.length > 0) matchedLabels.add(domain.label);
    rows.forEach((row) => results.push(domain.map(row)));
  }

  const interpretation = matchedLabels.size
    ? `${[...matchedLabels].join(' · ')} · "${words.join(' ')}"`
    : `No matches for "${words.join(' ')}"`;

  return { interpretation, results };
}

export async function listStudyCourses() {
  const courses = await db('courses').select('*');
  const [fMap, qMap] = await Promise.all([
    countByColumn('flashcards', 'course_id'),
    countByColumn('quiz_questions', 'course_id'),
  ]);

  return courses.map((c) => ({
    id: `course-${c.id}`,
    code: c.code,
    title: c.title,
    icon: c.icon,
    colorKey: c.color_key,
    flashcardCount: fMap.get(c.id) ?? 0,
    quizCount: qMap.get(c.id) ?? 0,
  }));
}

export async function getCourseStudy(courseId) {
  const course = await db('courses').where({ id: courseId }).first();
  if (!course) return null;

  const flashcards = await db('flashcards').where({ course_id: courseId });
  const quizQuestions = await db('quiz_questions').where({ course_id: courseId });

  return {
    course: { id: `course-${course.id}`, code: course.code, title: course.title },
    flashcards: flashcards.map((f) => ({ id: `flash-${f.id}`, front: f.front, back: f.back })),
    quiz: quizQuestions.map((q) => ({ id: `quiz-${q.id}`, q: q.question, options: q.options, answer: q.answer_index })),
    summary: {
      keyConcepts: flashcards.map((f) => f.front.replace(/^What (is|does)\s*/i, '').replace(/\?$/, '')),
      points: flashcards.map((f) => f.back),
    },
  };
}

async function buildRevisionPlan(userId) {
  const exams = await db('exams')
    .join('courses', 'courses.id', 'exams.course_id')
    .where('exams.exam_date', '>=', new Date().toISOString().slice(0, 10))
    .select('exams.exam_date', 'courses.title')
    .orderBy('exams.exam_date')
    .limit(5);

  if (exams.length === 0) return 'You have no upcoming exams scheduled, so there\'s nothing to build a revision plan around yet.';

  const lines = exams.map((e) => `• ${new Date(e.exam_date).toDateString()}: ${e.title}`);
  return `Here's a revision plan based on your real exam schedule:\n\n${lines.join('\n')}\n\nOpen Exams to see full details.`;
}

async function opportunityMatches(userId) {
  const skills = await db('user_skills').where({ user_id: userId }).pluck('skill');
  const skillSet = new Set(skills.map((s) => s.toLowerCase()));
  const opps = await db('opportunities').select('*');

  const scored = opps
    .map((o) => ({
      role: o.role,
      company: o.company,
      mode: o.mode,
      matched: o.tags?.length ? Math.round((o.tags.filter((t) => skillSet.has(t.toLowerCase())).length / o.tags.length) * 100) : 0,
    }))
    .sort((a, b) => b.matched - a.matched)
    .slice(0, 3);

  if (scored.length === 0) return 'No opportunities are posted yet.';
  const lines = scored.map((o) => `• ${o.role} at ${o.company} (${o.mode}, ${o.matched}% match)`);
  return `Based on your real skill profile, here are your top matches:\n\n${lines.join('\n')}\n\nOpen iCareer to view and apply.`;
}

/** Finds the course named in `text` (by first word of its title), else the first course. */
async function resolveMentionedCourse(text) {
  const courses = await db('courses').select('*');
  const mentioned = courses.find((c) => text.toLowerCase().includes(c.title.toLowerCase().split(' ')[0]));
  return mentioned ?? courses[0] ?? null;
}

async function courseSummaryReply(text) {
  const course = await resolveMentionedCourse(text);
  if (!course) return "You don't have any courses set up yet.";

  const flashcards = await db('flashcards').where({ course_id: course.id }).limit(4);
  if (flashcards.length === 0) return `No study material is available for ${course.title} yet.`;

  const lines = flashcards.map((f) => `• ${f.back}`);
  return `Summary of "${course.title}" from your study material:\n\n${lines.join('\n')}\n\nOpen Study Assistant for flashcards and a quiz.`;
}

async function quizReply(text) {
  const course = await resolveMentionedCourse(text);
  if (!course) return "You don't have any courses set up yet.";

  const questions = await db('quiz_questions').where({ course_id: course.id }).limit(3);
  if (questions.length === 0) return `No quiz is available for ${course.title} yet.`;

  const lines = questions.map((q, i) => `${i + 1}. ${q.question}`);
  return `Here's a quick quiz on ${course.title}:\n\n${lines.join('\n')}\n\nOpen Study Assistant for the full interactive quiz with instant marking.`;
}

export async function chatReply(userId, text) {
  const t = text.toLowerCase();
  if (/internship|job|scholarship|opportunit|career/.test(t)) return opportunityMatches(userId);
  if (/quiz/.test(t)) return quizReply(t);
  if (/summar|notes/.test(t)) return courseSummaryReply(t);
  if (/revision plan|study plan|revision schedule/.test(t)) return buildRevisionPlan(userId);

  return "I can help with study summaries, quizzes, revision plans and matching you to real opportunities, all pulled from your actual courses and profile. Try one of the tools below, or ask about a specific course.";
}
