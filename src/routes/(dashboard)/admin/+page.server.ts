import { N_EMPLOYEES_HOME, SUPABASE_AUTH_TAG } from "@/constants"
import { getAllEmployees, getUser } from "@/server/db/user"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ depends, locals }) => {
  depends(SUPABASE_AUTH_TAG)

  const userProfile = getUser(locals)
  const employees = getAllEmployees(locals, N_EMPLOYEES_HOME)

  // stream promises for faster response
  return { userProfile, employees }
}
