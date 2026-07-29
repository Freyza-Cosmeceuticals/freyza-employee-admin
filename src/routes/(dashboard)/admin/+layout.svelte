<script lang="ts">
import AppNavbar from "$lib/components/dashboard/AppNavbar.svelte"
import AppSidebar from "$lib/components/dashboard/AppSidebar.svelte"
import * as Sidebar from "@ui/sidebar"

let { data, children } = $props()
let { supabase, session, claims, deploymentGitBranch } = $derived(data)
</script>

<Sidebar.Provider>
  <AppSidebar />
  <Sidebar.Inset class="w-full min-w-0">
    <AppNavbar {supabase} {session} {claims} {deploymentGitBranch} />
    <main>
      {@render children?.()}
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>
