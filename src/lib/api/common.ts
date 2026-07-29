import { error } from "@sveltejs/kit"

import { UserRole, UserStatus } from "$lib/types"

/**
 * Guard Function to check for Auth, optionally non-Admin, otherwise throw 403 Forbidden
 */
export async function requireAuthMaybeAdmin(locals: App.Locals, admin: boolean = true) {
  const { supabase } = locals

  const claims = await locals.requireAuth()

  if (!claims) {
    console.error("Unauthorized call to employee remote function")
    error(401, "Unauthorized")
  }

  // must be active
  if (claims.app_metadata?.app_status !== UserStatus.ACTIVE) {
    console.error("Current user is not active anymore")
    error(404, "Not found")
  }

  // Check for admin
  if (admin) {
    if (
      claims.app_metadata?.app_role !== UserRole.ADMIN &&
      claims.app_metadata?.app_status !== UserStatus.ACTIVE
    ) {
      console.error("Unauthorized call to employee remote function")
      error(403, "Forbidden")
    }
  }

  return { claims, supabase }
}
