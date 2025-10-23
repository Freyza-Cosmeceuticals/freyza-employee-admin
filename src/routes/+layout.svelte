<script lang="ts">
import "../app.css"

import favicon from "$lib/assets/favicon.svg"
import { onMount } from "svelte"
import { invalidate } from "$app/navigation"

import { ModeWatcher } from "mode-watcher"
import Navbar from "@/components/resuable/Navbar.svelte"

let { data, children } = $props()
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

<!-- Root Layout -->

<ModeWatcher />

<Navbar />

<main>
  {@render children?.()}
</main>
