export const ROLES = ['student', 'lecturer', 'university_admin', 'club_admin', 'employer', 'platform_admin'];

/** Roles that require admin approval (status starts 'pending') before they can log in. */
export const APPROVAL_REQUIRED_ROLES = ROLES.filter((r) => r !== 'student');
