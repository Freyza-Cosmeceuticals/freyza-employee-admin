<script lang="ts">
import Navbar from "$lib/components/reusable/Navbar.svelte"

let { data, children } = $props()
let { session, user, supabase } = $derived(data)
</script>

<!-- Unauthenticated Layout -->

<Navbar {session} {user} {supabase} />

<main>
  {@render children?.()}
</main>
