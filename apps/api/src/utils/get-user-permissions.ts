import { userSchema, type Role, defineAbilityFor } from "@saas/auth";

export function getUserPermissions(userId: string, role: Role) {
  const authUser = userSchema.parse({ id: userId, role });

  const ability = defineAbilityFor(authUser);

  return ability;
}