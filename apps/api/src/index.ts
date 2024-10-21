import { defineAbilityFor, projectSchema } from "@saas/auth";

const ability = defineAbilityFor({ role: "MEMBER", id: "user-id" });

const project = projectSchema.parse({ id: "project-id", ownerId: "user-id" });

const userCanInviteSomeoneElse = ability.can("get", "User");

console.log("hello", ability.can("delete", project));
