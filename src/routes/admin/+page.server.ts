import { getAllEmployees, getUser } from "@/server/db/user"
import type { PageServerLoad } from "./$types"
import { SUPABASE_AUTH_TAG } from "@/constants"

export const load: PageServerLoad = async ({ depends, locals }) => {
  depends(SUPABASE_AUTH_TAG)

  const userProfile = await getUser(locals)
  const employees = getAllEmployees(locals, 5)

  return { userProfile, employees }
}
