<script lang="ts">
import "../app.css"

import favicon from "$lib/assets/favicon.svg"
import { onMount } from "svelte"
import { invalidate } from "$app/navigation"

import { ModeWatcher } from "mode-watcher"
import Navbar from "@/components/reusable/Navbar.svelte"
import { page } from "$app/state"
import { SUPABASE_AUTH_TAG } from "@/constants"

let { data, children } = $props()
let { session, user, supabase } = $derived(data)

onMount(() => {
  const { data } = supabase.auth.onAuthStateChange((changeEvent, newSession) => {
    console.log(`Auth State changed: ${changeEvent}`, newSession)

    if (newSession?.expires_at != session?.expires_at) {
      console.log("Invalidating current auth session")
      invalidate(SUPABASE_AUTH_TAG)
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

<!-- Admin has it's own navbar -->
{#if !page.url.pathname.startsWith("/admin")}
  <Navbar {session} {user} {supabase} />
{/if}

<main>
  {@render children?.()}
</main>
