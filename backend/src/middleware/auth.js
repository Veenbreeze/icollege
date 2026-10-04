import { verifyAccessToken } from '../utils/jwt.js';
import { db } from '../db/pool.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  let payload;
  try { payload = verifyAccessToken(header.slice('Bearer '.length)); } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  if (!payload.universityId) return res.status(401).json({ error: 'Session needs to be renewed' });
  try {
    const account = await db('users').join('universities', 'universities.id', 'users.university_id')
      .where('users.id', payload.sub).first('users.id', 'users.student_id', 'users.role', 'users.status', 'users.university_id', 'users.department_id', 'universities.status as university_status');
    if (!account || account.status !== 'active' || account.university_status !== 'active' || account.university_id !== payload.universityId) {
      return res.status(401).json({ error: 'Account is inactive or session is invalid' });
    }
    req.user = { id: account.id, studentId: account.student_id, role: account.role, universityId: account.university_id, departmentId: account.department_id };
    return next();
  } catch (error) {
    return next(error);
  }
}
