export function handleDbError(e: unknown): { data: null; error: string } {
  if (e instanceof Error) {
    console.error(e)
    return { data: null, error: e.message }
  }

  console.error(e)
  return { data: null, error: "An unknown error has occurred" }
}

/* The holy drizzle db */
export { db } from "./index"
