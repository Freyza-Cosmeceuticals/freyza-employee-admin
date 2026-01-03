import type { ParamMatcher } from "@sveltejs/kit"

export const match = ((param: string): param is string => {
  return /^\d{4}$/.test(param) && !isNaN(parseInt(param, 10))
}) satisfies ParamMatcher
