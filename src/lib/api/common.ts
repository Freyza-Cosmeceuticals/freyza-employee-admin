import { error } from "@sveltejs/kit"

import { UserRole, UserStatus } from "@db/client"

/**
 * Guard Function to check for Auth, optionally non-Admin, otherwise throw 403 Forbidden
 */
export function requireAuthMaybeAdmin(locals: App.Locals, admin: boolean = true) {
  const { user, supabase, session } = locals

  if (!user || !session) {
    console.error("Unauthorized call to employee remote function")
    error(401, "Unauthorized")
  }

  // must be active
  if (user.app_metadata.app_status !== UserStatus.ACTIVE) {
    console.error("Current user is not active anymore")
    error(404, "Not found")
  }

  // Check for admin
  if (admin) {
    if (
      user.app_metadata.app_role !== UserRole.ADMIN &&
      user.app_metadata.app_status !== UserStatus.ACTIVE
    ) {
      console.error("Unauthorized call to employee remote function")
      error(403, "Forbidden")
    }
  }

  return { user, session, supabase }
}
