<script lang="ts">
import AppNavbar from "$lib/components/dashboard/AppNavbar.svelte"
import AppSidebar from "$lib/components/dashboard/AppSidebar.svelte"
import * as Sidebar from "@ui/sidebar"

let { data, children } = $props()
let { supabase, session, user, deploymentGitBranch } = $derived(data)
</script>

<Sidebar.Provider>
  <AppSidebar />
  <Sidebar.Inset class="min-w-0 w-full">
    <AppNavbar {supabase} {session} {user} {deploymentGitBranch} />
    <main>
      {@render children?.()}
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>
