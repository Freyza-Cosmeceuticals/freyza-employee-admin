import { error } from "@sveltejs/kit"

import { UserRole, UserStatus } from "$lib/types"

/**
 * Guard Function to check for Auth, optionally non-Admin, otherwise throw 403 Forbidden
 */
export function requireAuthMaybeAdmin(
  { user, session, supabase }: App.Locals,
  admin: boolean = true
) {
  if (!user) {
    console.error("Oh current user is non-existent, return")
    error(403, "Forbidden")
  }

  if (!session) {
    console.error("Oh current session is non-existent, return")
    error(403, "Forbidden")
  }

  // must be active
  if (user.app_metadata.app_status !== UserStatus.ACTIVE) {
    console.error("Current user is not active anymore")
    error(404, "Not found")
  }

  if (admin) {
    if (user.app_metadata.app_role !== UserRole.ADMIN) {
      console.error("Unauthorized call to employee remote function")
      error(403, "Forbidden")
    }
  }

  return { user, session, supabase }
}

export function handleDbError(e: unknown): { data: null; error: string } {
  if (e instanceof Error) {
    console.error(e)
    return { data: null, error: e.message }
  }

  console.error(e)
  return { data: null, error: "An unknown error has occurred" }
}

/* The holy drizzle db */
export { db } from "./index"
