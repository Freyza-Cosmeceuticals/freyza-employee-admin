import { Settings } from "luxon"

Settings.defaultZone = "Asia/Kolkata"

export const load = async ({ locals, cookies }) => {
  const { session, claims } = await locals.getAuth()
  return {
    session,
    claims,
    cookies: cookies.getAll()
  }
}
