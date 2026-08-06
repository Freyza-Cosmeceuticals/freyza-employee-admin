import { DrizzleQueryError } from "drizzle-orm"

export function handleDbError(e: unknown): { data: null; error: string } {
  if (e instanceof Error) {
    console.error("dbError: ", e)

    if (e instanceof DrizzleQueryError) {
      const code = (e.cause as any)?.code
      if (code === "23503") {
        console.error("dbError: Foreign key violation", e.cause)
        return { data: null, error: "Foreign key violation" }
      } else if (code === "23505") {
        console.error("dbError: Unique constraint violation", e.cause)
        return { data: null, error: "Unique constraint violation" }
      }
    }

    return { data: null, error: e.message }
  }

  console.error("dbError: ", e)
  return { data: null, error: "An unknown error has occurred" }
}

/* The holy drizzle db */
export { db } from "./index"
