import type { ParamMatcher } from "@sveltejs/kit"

export const match = ((param: string): param is string => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    param.toLowerCase()
  )
}) satisfies ParamMatcher
