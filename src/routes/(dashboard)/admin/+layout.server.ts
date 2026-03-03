/**
 * This file is necessary to ensure protection of all routes in the `admin`
 * directory. It makes the routes in this directory _dynamic_ routes, which
 * send a server request, and thus trigger `hooks.server.ts`.
 **/

// @ts-ignore
import { VERCEL_GIT_COMMIT_REF } from "$env/static/private"
import { redirect } from "@sveltejs/kit"

import { SUPABASE_AUTH_TAG } from "$lib/constants"

export const load = async ({ locals, setHeaders, depends }) => {
  depends(SUPABASE_AUTH_TAG)

  const user = locals.user
  const session = locals.session
  if (!user || !session) {
    throw redirect(303, "/auth")
  }

  setHeaders({
    "cache-control": "no-store"
  })

  return { user, session, deploymentGitBranch: VERCEL_GIT_COMMIT_REF }
}
