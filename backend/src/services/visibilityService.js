import { db } from '../db/pool.js';

/** Append the shared national/university/department/course visibility predicate. */
export function visibleChamber(query, user, alias = 'chambers') {
  return query.where(function () {
    this.where(`${alias}.visibility`, 'national').orWhere(function () {
      this.where(`${alias}.university_id`, user.universityId).andWhere(function () {
        this.where(`${alias}.visibility`, 'university')
          .orWhere(function () { this.where(`${alias}.visibility`, 'department').where(`${alias}.department_id`, user.departmentId ?? -1); })
          .orWhere(function () {
            this.where(`${alias}.visibility`, 'course').whereIn(`${alias}.course_id`, db('student_course_enrollments')
              .select('course_id').where({ student_id: user.id, university_id: user.universityId, status: 'active' }));
          });
      });
    });
  });
}

export function visibleNotice(query, user, alias = 'notices') {
  return query.where(function () {
    this.where(`${alias}.visibility`, 'national').orWhere(function () {
      this.where(`${alias}.university_id`, user.universityId).andWhere(function () {
        this.where(`${alias}.visibility`, 'university')
          .orWhere(function () { this.where(`${alias}.visibility`, 'department').where(`${alias}.department_id`, user.departmentId ?? -1); })
          .orWhere(function () {
            this.where(`${alias}.visibility`, 'course').whereIn(`${alias}.course_id`, db('student_course_enrollments')
              .select('course_id').where({ student_id: user.id, university_id: user.universityId, status: 'active' }));
          });
      });
    });
  });
}
