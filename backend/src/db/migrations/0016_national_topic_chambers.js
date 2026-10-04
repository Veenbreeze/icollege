const TOPIC_CHAMBERS = [
  { slug: 'economics', name: 'Economics', tagline: 'Learn. Discuss. Grow.', description: 'A national community for students passionate about economics, business, markets and development.', theme_key: 'economics', emoji: '📈' },
  { slug: 'ai', name: 'Artificial Intelligence', tagline: 'Imagine. Build. Share.', description: 'A national community for student interests in artificial intelligence, machine learning and responsible innovation.', theme_key: 'ai', emoji: '🤖' },
  { slug: 'social', name: 'Social Life', tagline: 'Connect. Belong.', description: 'A national community for student life, culture, events and making friends across campuses.', theme_key: 'social', emoji: '👥' },
  { slug: 'media', name: 'Media & Culture', tagline: 'Stories. Sound. Screen.', description: 'A national community for student creators, journalism, film, music and digital culture.', theme_key: 'media', emoji: '🎙️' },
  { slug: 'music', name: 'Music', tagline: 'Discover. Listen. Connect.', description: 'Explore music and connect with student listeners and creators. Song previews link to the official store listing.', theme_key: 'music', emoji: '🎧' },
];

/** Add globally discoverable topic chambers without removing existing content. */
export async function up(knex) {
  const legacy = await knex('universities').where({ slug: 'legacy-unassigned' }).first('id');
  const fallback = legacy ?? await knex('universities').first('id');
  if (!fallback) throw new Error('Create a university before seeding national topic chambers');
  for (const chamber of TOPIC_CHAMBERS) {
    await knex('chambers').insert({ university_id: fallback.id, ...chamber, visibility: 'national', department_id: null, course_id: null })
      .onConflict('slug').merge({ ...chamber, visibility: 'national', department_id: null, course_id: null });
  }
}

/** Keep new chambers if they have user data; restore prior scopes on rollback. */
export async function down(knex) {
  await knex('chambers').whereIn('slug', ['economics', 'social', 'music']).update({ visibility: 'university' });
  for (const slug of ['ai', 'media']) {
    const chamber = await knex('chambers').where({ slug }).first('id');
    if (!chamber) continue;
    const [posts, members] = await Promise.all([
      knex('posts').where({ chamber_id: chamber.id }).count('* as count').first(),
      knex('chamber_members').where({ chamber_id: chamber.id }).count('* as count').first(),
    ]);
    if (Number(posts.count) || Number(members.count)) throw new Error(`Cannot remove ${slug} chamber during rollback because it contains user data`);
    await knex('chambers').where({ id: chamber.id }).delete();
  }
}
