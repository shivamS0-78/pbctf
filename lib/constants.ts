/**
 * Shared runtime constants. Single source of truth for values otherwise
 * scattered across components.
 */

/** Maximum number of operators per team. */
export const TEAM_SIZE = 2 as const;

/** Discord username pattern (modern usernames: 2-32 chars, lowercase, digits, dots, underscores). */
export const DISCORD_USERNAME_REGEX = /^[a-z0-9._]{2,32}$/;

/** File size caps (in MB). */
export const FILE_SIZE = {
  resume: 5,
  profilePhoto: 2,
} as const;
