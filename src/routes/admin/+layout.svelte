<script lang="ts">
import type { Session, SupabaseClient } from "@supabase/supabase-js"
import type { Snippet } from "svelte"

interface Props {
  data: { session: Session; supabase: SupabaseClient }
  children: Snippet<[]>
}

let { data, children }: Props = $props()
let { supabase } = $derived(data)

const logout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error(error)
  }
}
</script>

<header>
  <nav>
    <a href="/">Home</a>
  </nav>
  <button onclick={logout}>Logout</button>
</header>
<main>
  {@render children()}
</main>
