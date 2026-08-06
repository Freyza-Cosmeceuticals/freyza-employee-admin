import type { JwtPayload, Session, SupabaseClient, User } from "@supabase/supabase-js";

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    interface Error {
      message: string,
      data?: any
    }
    interface Locals {
      supabase: SupabaseClient
      getAuth: () => Promise<{ session: Session; claims: JwtPayload } | { session: null; claims: null }>
      requireAuth: () => Promise<JwtPayload>
      requestId: string
    }
    interface PageData {
      session: Session | null
    }
    interface PageState {
      employeeId?: string
    }
    // interface Platform {}
  }
}

export { };
