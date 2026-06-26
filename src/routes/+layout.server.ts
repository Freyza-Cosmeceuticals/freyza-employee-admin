import { Settings } from "luxon"

Settings.defaultZone = "Asia/Kolkata"

export const load = async ({ locals: { safeGetSession }, cookies }) => {
  const { session } = await safeGetSession()
  return {
    session,
    cookies: cookies.getAll()
  }
}
