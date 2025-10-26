import { getUser } from "@/auth"
import type { PageServerLoad } from "./$types"
import { SUPABASE_AUTH_TAG } from "@/constants"

export const load: PageServerLoad = async ({ depends, locals }) => {
  depends(SUPABASE_AUTH_TAG)

  const userProfile = await getUser(locals)
  return { userProfile }
}
