<script lang="ts">
import AppNavbar from "@/components/dashboard/AppNavbar.svelte"
import AppSidebar from "@/components/dashboard/AppSidebar.svelte"
import * as Sidebar from "@/components/ui/sidebar"

let { data, children } = $props()
let { supabase, session, user } = $derived(data)
</script>

<Sidebar.Provider>
  <AppSidebar />
  <Sidebar.Inset>
    <AppNavbar {supabase} {session} {user} />
    <main>
      {@render children?.()}
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>
