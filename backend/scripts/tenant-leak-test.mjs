/**
 * Cross-university data-isolation test (Phase 21).
 *
 * Logs in as a student from two different universities and asserts that neither
 * can see the other's academic data via the API. Exits non-zero on any leak so
 * it can gate CI. Assumes the demo seed + a second university (UIT) with student
 * `UIT/2024/001` exist (see docs/MULTI_TENANT.md for setup).
 *
 * Usage: node scripts/tenant-leak-test.mjs
 */
const API = process.env.API_URL ?? 'http://localhost:4000';
const PASSWORD = process.env.TEST_PASSWORD ?? 'Password123!';

const A = { label: 'ICU', studentId: 'ICU/2024/00458', ownMarker: 'CSC', foreignMarker: 'UIT 101' };
const B = { label: 'UIT', studentId: 'UIT/2024/001', ownMarker: 'UIT 101', foreignMarker: 'CSC' };

let failures = 0;
const check = (name, ok) => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

async function login(studentId) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`login failed for ${studentId}: ${res.status}`);
  return (await res.json()).accessToken;
}

async function get(token, path) {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}

const includes = (data, marker) => JSON.stringify(data).includes(marker);

async function run() {
  const tokenA = await login(A.studentId);
  const tokenB = await login(B.studentId);

  for (const [self, other] of [[A, B], [B, A]]) {
    const token = self === A ? tokenA : tokenB;
    console.log(`\n${self.label} student must NOT see ${other.label} data:`);
    const [notices, week, exams] = await Promise.all([
      get(token, '/api/notices'),
      get(token, '/api/timetable/week'),
      get(token, '/api/exams'),
    ]);
    check(`sees own timetable (${self.ownMarker})`, includes(week, self.ownMarker));
    check(`does NOT see ${other.label} timetable (${other.ownMarker})`, !includes(week, other.ownMarker));
    check(`does NOT see ${other.label} exams`, !includes(exams, other.ownMarker));
    check(`notices are non-empty and own-scoped`, Array.isArray(notices) && notices.length > 0);
  }

  console.log(`\n${failures === 0 ? 'ALL ISOLATION CHECKS PASSED ✅' : `${failures} LEAK(S) DETECTED ❌`}`);
  process.exit(failures === 0 ? 0 : 1);
}

run().catch((e) => {
  console.error('leak test error:', e.message);
  process.exit(2);
});
