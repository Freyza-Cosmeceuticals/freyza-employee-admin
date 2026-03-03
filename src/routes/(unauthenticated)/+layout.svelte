<script lang="ts">
import Navbar from "$lib/components/reusable/Navbar.svelte"

let { data, children } = $props()
let { session, user, supabase, deploymentGitBranch } = $derived(data)
</script>

<!-- Unauthenticated Layout -->

<Navbar {session} {user} {supabase} {deploymentGitBranch} />

<main>
  {@render children?.()}
</main>
