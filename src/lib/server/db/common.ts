import { UserRole, UserStatus } from "@db/client"
import { error } from "@sveltejs/kit"

/**
 * Guard Function to check for Auth, optionally non-Admin, otherwise throw 403 Forbidden
 */
export function requireAdminAuth({ user, session, supabase }: App.Locals, admin: boolean = true) {
  if (!user) {
    console.error("Oh current user is non-existent, return")
    error(403, "Forbidden")
  }

  if (!session) {
    console.error("Oh current session is non-existent, return")
    error(403, "Forbidden")
  }

  // must be active
  if (user.user_metadata.status !== UserStatus.ACTIVE) {
    console.error("Current user is not active anymore")
    error(404, "Not found")
  }

  if (admin) {
    if (user.user_metadata.role !== UserRole.ADMIN) {
      console.error("Unauthorized call to employee remote function")
      error(403, "Forbidden")
    }
  }

  return { user, session, supabase }
}
