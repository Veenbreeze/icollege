import bcrypt from 'bcryptjs';
import { db } from './pool.js';

const required = [
  'BOOTSTRAP_UNIVERSITY_SLUG', 'BOOTSTRAP_UNIVERSITY_NAME',
  'BOOTSTRAP_ADMIN_STUDENT_ID', 'BOOTSTRAP_ADMIN_FULL_NAME',
  'BOOTSTRAP_ADMIN_EMAIL', 'BOOTSTRAP_ADMIN_PASSWORD',
];

async function bootstrap() {
  if (required.some((key) => !process.env[key])) throw new Error(`Set these environment variables for a one-time bootstrap: ${required.join(', ')}`);
  const slug = process.env.BOOTSTRAP_UNIVERSITY_SLUG.trim().toLowerCase();
  const name = process.env.BOOTSTRAP_UNIVERSITY_NAME.trim();
  const studentId = process.env.BOOTSTRAP_ADMIN_STUDENT_ID.trim();
  const fullName = process.env.BOOTSTRAP_ADMIN_FULL_NAME.trim();
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!/^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/.test(slug) || name.length < 2 || name.length > 160
      || studentId.length < 3 || studentId.length > 80 || fullName.length < 2 || fullName.length > 160
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || password.length < 12 || password.length > 128) {
    throw new Error('Bootstrap values are invalid; admin password must be 12-128 characters.');
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await db.transaction(async (trx) => {
    const existingAdmin = await trx('users').join('universities', 'universities.id', 'users.university_id')
      .where({ 'users.role': 'platform_admin', 'users.status': 'active', 'universities.status': 'active' }).first('users.id');
    if (existingAdmin) throw new Error('An active platform administrator already exists.');

    let university = await trx('universities').where({ slug }).first('id', 'status');
    if (!university) {
      [university] = await trx('universities').insert({ slug, name, status: 'active' }).returning(['id', 'status']);
    } else if (university.status !== 'active') {
      throw new Error('The university slug already exists but is not active; review and activate it explicitly first.');
    }
    const existingUser = await trx('users').where({ university_id: university.id, student_id: studentId }).first('id');
    if (existingUser) throw new Error('That admin student ID already exists in the target university.');
    await trx('users').insert({
      university_id: university.id, student_id: studentId, full_name: fullName, email,
      password_hash: passwordHash, role: 'platform_admin', status: 'active',
    });
  });
  console.log(`Platform administrator created for active university "${slug}". Remove bootstrap environment values now.`);
}

bootstrap().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(() => db.destroy());
