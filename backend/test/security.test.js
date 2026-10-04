import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../src/db/pool.js';
import { visibleChamber, visibleNotice } from '../src/services/visibilityService.js';
import { signedMediaUrl, verifyMediaUrl, signedDocumentUrl, verifyDocumentUrl } from '../src/middleware/upload.js';

test('visibility SQL scopes university, department, and enrolled course rows', () => {
  const user = { id: 17, universityId: 4, departmentId: 9 };
  for (const [predicate, table] of [[visibleChamber, 'chambers'], [visibleNotice, 'notices']]) {
    const { sql, bindings } = predicate(db(table), user).toSQL();
    assert.ok(sql.includes(`"${table}"."university_id"`));
    assert.ok(sql.includes(`"${table}"."department_id"`));
    assert.match(sql, /student_course_enrollments/);
    assert.ok(bindings.includes('national'));
    assert.ok(bindings.includes(4));
    assert.ok(bindings.includes(9));
    assert.ok(bindings.includes(17));
    assert.ok(bindings.includes('active'));
  }
});

test('signed media links bind resource kind, id, and user and reject tampering', () => {
  const url = signedMediaUrl('reel', 81, 17);
  const parsed = new URL(url, 'https://icollege.invalid');
  const signature = parsed.searchParams.get('signature');
  const expires = parsed.searchParams.get('expires');
  assert.equal(verifyMediaUrl('reel', '81', '17', expires, signature), true);
  assert.equal(verifyMediaUrl('story', '81', '17', expires, signature), false);
  assert.equal(verifyMediaUrl('reel', '81', '18', expires, signature), false);
  assert.equal(verifyMediaUrl('reel', '81', '17', expires, `${signature.slice(0, -2)}00`), false);
});

test('signed document links bind document and user and reject expired links', () => {
  const url = signedDocumentUrl(81, 17);
  const parsed = new URL(url, 'https://icollege.invalid');
  const signature = parsed.searchParams.get('signature');
  const expires = parsed.searchParams.get('expires');
  assert.equal(verifyDocumentUrl('81', '17', expires, signature), true);
  assert.equal(verifyDocumentUrl('82', '17', expires, signature), false);
  assert.equal(verifyDocumentUrl('81', '17', String(Math.floor(Date.now() / 1000) - 1), signature), false);
});
