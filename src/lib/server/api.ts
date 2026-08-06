import { error } from "@sveltejs/kit"

import { UserRole, UserStatus } from "$lib/types"

import { DrizzleQueryError } from "drizzle-orm"

import type { SupabaseClient } from "@supabase/supabase-js"

export async function requireApiAuth(
  request: Request,
  supabase: SupabaseClient,
  admin: boolean = false
) {
  const authHeader = request.headers.get("Authorization")
  const token = authHeader?.replace("Bearer ", "")

  if (!token) {
    console.error("API Auth: No token provided")
    error(401, "Unauthorized: Missing token")
  }

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser(token)

  if (authError || !user) {
    console.error("API Auth: Invalid token", authError)
    error(401, "Unauthorized: Invalid token")
  }

  if (user.app_metadata?.app_status !== UserStatus.ACTIVE) {
    console.error(`API Auth: User ${user.id} is not active`)
    error(403, "Forbidden: User account is inactive")
  }

  if (admin && user.app_metadata?.app_role !== UserRole.ADMIN) {
    console.error(`API Auth: User ${user.id} attempted to access admin route`)
    error(403, "Forbidden: Requires Admin privileges")
  }

  return user
}

export function handleApiError(e: any) {
  if (e.status) throw e

  if (e instanceof DrizzleQueryError) {
    if (e.cause && (e.cause as any).code === "23503") {
      console.error("API Error: Foreign key violation", e.cause)
      throw error(400, "Bad Request: Foreign key violation")
    }
  }

  console.error(e)
  throw error(500, e.message || "Internal Server Error")
}
