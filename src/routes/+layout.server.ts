import { Settings } from "luxon"
import type { LayoutServerLoad } from "./$types"

Settings.defaultZone = "Asia/Kolkata"

export const load: LayoutServerLoad = async ({ locals: { safeGetSession }, cookies }) => {
  const { session } = await safeGetSession()
  return {
    session,
    cookies: cookies.getAll(),
  }
}
