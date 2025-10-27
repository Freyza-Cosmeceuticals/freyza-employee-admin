<script lang="ts">
import type { Session, SupabaseClient } from "@supabase/supabase-js"
import ColorModeToggle from "@/components/reusable/ColorModeToggle.svelte"
import type { User } from "@supabase/supabase-js"
// import AccountDropdown from "@/components/reusable/AccountDropdown.svelte"
import * as Sidebar from "@/components/ui/sidebar"

interface Props {
  session: Session | null
  user: User | null
  supabase: SupabaseClient
}

const { session, user, supabase }: Props = $props()
</script>

<!-- Dashboard Navbar -->
<header>
  <nav
    class={[
      "mx-auto flex h-16 w-full flex-row items-center justify-between rounded-md px-4 py-2 shadow-sm",
    ]}
  >
    <div class="flex flex-row items-center gap-4">
      <Sidebar.Trigger class="-ml-1" />
      <a href="/admin/employees"> Employees </a>
      <a href="/admin/expenses">Expenses</a>
    </div>

    <div class="flex flex-row gap-2">
      {#if session !== null && user !== null}
        <!-- <AccountDropdown {session} {user} {supabase} /> -->
      {/if}
      <ColorModeToggle />
    </div>
  </nav>
</header>
