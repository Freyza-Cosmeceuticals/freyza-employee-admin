import { error } from "@sveltejs/kit"

import { UserRole, UserStatus } from "$lib/types"

import { DrizzleQueryError } from "drizzle-orm"

import type { SupabaseClient } from "@supabase/supabase-js"

export type ApiIssue = {
  kind: string
  input: unknown
  received: string
  message: string
  path: { key: unknown }[]
}

export async function requireApiAuth(
  request: Request,
  supabase: SupabaseClient,
  admin: boolean = false
) {
  const authHeader = request.headers.get("Authorization")
  const token = authHeader?.replace("Bearer ", "")

  if (!token) {
    console.error("API Auth: No token provided")
    throw error(401, "Unauthorized: Missing token")
  }

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser(token)

  if (authError || !user) {
    console.error("API Auth: Invalid token", authError)
    throw error(401, "Unauthorized: Invalid token")
  }

  if (user.app_metadata?.app_status !== UserStatus.ACTIVE) {
    console.error(`API Auth: User ${user.id} is not active`)
    throw error(403, "Forbidden: User account is inactive")
  }

  if (admin && user.app_metadata?.app_role !== UserRole.ADMIN) {
    console.error(`API Auth: User ${user.id} attempted to access admin route`)
    throw error(403, "Forbidden: Requires Admin privileges")
  }

  return user
}

export function handleApiError(e: any) {
  if (e.status) throw e

  if (e instanceof DrizzleQueryError) {
    const code = e.cause ? (e.cause as any).code : undefined
    if (code === "23503") {
      console.error("API Error: Foreign key violation", e.cause)
      throw error(400, "Foreign key violation")
    } else if (code === "23505") {
      console.error("API Error: Unique violation", e.cause)
      throw error(400, "Unique violation")
    }
  }

  console.error("apiError: ", e)
  throw error(500, e.message || "Internal Server Error")
}
