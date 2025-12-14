/**
 * This file is necessary to ensure protection of all routes in the `admin`
 * directory. It makes the routes in this directory _dynamic_ routes, which
 * send a server request, and thus trigger `hooks.server.ts`.
 **/

import { redirect } from "@sveltejs/kit"

export const load = async ({ locals, setHeaders }) => {
  const user = locals.user
  if (!user) {
    throw redirect(303, "/auth")
  }

  setHeaders({
    "cache-control": "no-store",
  })

  return { user }
}
