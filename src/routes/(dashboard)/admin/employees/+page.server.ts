import { SUPABASE_AUTH_TAG } from "@/constants"
import { getAllEmployees } from "@/server/db/user"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ depends, locals }) => {
  // depends(SUPABASE_AUTH_TAG)

  const employees = getAllEmployees(locals)

  return { employees }
}
