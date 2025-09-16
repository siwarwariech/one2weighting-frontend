// src/types/role.ts
export const ROLES = ["admin", "client", "user"] as const;
export type Role = typeof ROLES[number];

export function isRole(x: unknown): x is Role {
  return typeof x === "string" && (ROLES as readonly string[]).includes(x);
}
