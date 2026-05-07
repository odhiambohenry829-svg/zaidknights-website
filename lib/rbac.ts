export const rolePermissions = {
  ADMIN: ["*"],
  COACH: ["events:manage", "attendance:manage", "ratings:manage", "announcements:create"],
  ORGANIZATION_ADMIN: ["organization:manage", "members:bulk-upload", "billing:view"],
  MEMBER: ["profile:view", "renewals:create", "events:register"],
  GUEST: ["contact:create", "donations:create", "organizations:register"],
} as const;

export type AppRole = keyof typeof rolePermissions;

export function roleCan(role: AppRole, permission: string) {
  const permissions = rolePermissions[role] as readonly string[];
  return permissions.includes("*") || permissions.includes(permission);
}
