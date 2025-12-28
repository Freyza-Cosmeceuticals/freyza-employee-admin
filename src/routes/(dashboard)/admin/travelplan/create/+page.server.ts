import { SUPABASE_AUTH_TAG, TIMEZONE } from "@/constants"
import { getAllRoutes } from "@/server/db/route"
import { getAllEmployees } from "@/server/db/user"
import type { PageServerLoad } from "./$types"
import { DateTime } from "luxon"

export const load: PageServerLoad = async ({ depends, locals }) => {
  // depends(SUPABASE_AUTH_TAG)

  const employees = await getAllEmployees(locals)
  const routes = await getAllRoutes(locals)
  const today = DateTime.now().setZone(TIMEZONE)

  return { employees, routes, today }
}
