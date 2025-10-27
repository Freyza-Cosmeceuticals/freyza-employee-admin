import { createClient } from "@supabase/supabase-js"
import { PUBLIC_SUPABASE_URL } from "$env/static/public"
import { SUPABASE_SECRET_SERVICE_KEY } from "$env/static/private"

const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

export { supabaseAdmin }
