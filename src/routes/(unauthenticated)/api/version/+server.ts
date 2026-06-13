import { VERCEL_GIT_COMMIT_REF } from "$env/static/private"
import { json } from "@sveltejs/kit"

import { DateTime } from "luxon"

export const GET = async () => {
  return json({
    commitRef: VERCEL_GIT_COMMIT_REF,
    serverTime: DateTime.now().toISO()
  })
}
