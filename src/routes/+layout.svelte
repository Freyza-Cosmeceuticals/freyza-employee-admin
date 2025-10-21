<script lang="ts">
import "../app.css"
import favicon from "$lib/assets/favicon.svg"
import { onMount, type Snippet } from "svelte"
import { invalidate } from "$app/navigation"
import type { Session, SupabaseClient } from "@supabase/supabase-js"

interface Props {
  data: { session: Session; supabase: SupabaseClient }
  children: Snippet<[]>
}

let { data, children }: Props = $props()
let { session, supabase } = $derived(data)

onMount(() => {
  const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
    if (newSession?.expires_at != session?.expires_at) {
      invalidate("supabase:auth")
    }
  })

  return () => data.subscription.unsubscribe()
})
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
