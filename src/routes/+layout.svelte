<script lang="ts">
import "../app.css"

import { invalidate } from "$app/navigation"
import favicon from "$lib/assets/favicon.svg"
import { onMount } from "svelte"

import { Toaster } from "$lib/components/ui/sonner"
import { SUPABASE_AUTH_TAG } from "@/constants"
import { Settings } from "luxon"
import { ModeWatcher } from "mode-watcher"

let { data, children } = $props()
let { session, supabase } = $derived(data)

onMount(() => {
  Settings.defaultZone = "Asia/Kolkata"
  Settings.defaultLocale = "en-IN"

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

<Toaster richColors />

{@render children?.()}
