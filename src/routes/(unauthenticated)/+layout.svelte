<script lang="ts">
import Navbar from "$lib/components/reusable/Navbar.svelte"

let { data, children } = $props()
let { session, claims, supabase, deploymentGitBranch } = $derived(data)
</script>

<!-- Unauthenticated Layout -->

<Navbar {session} {claims} {supabase} {deploymentGitBranch} />

<main>
  {@render children?.()}
</main>
