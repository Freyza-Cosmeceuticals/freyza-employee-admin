<script lang="ts">
import { navigating } from "$app/state"

import AccountDropdown from "@/components/reusable/AccountDropdown.svelte"
import ColorModeToggle from "@/components/reusable/ColorModeToggle.svelte"
import * as Sidebar from "@/components/ui/sidebar"

import { fade } from "svelte/transition"

import type { Session, SupabaseClient, User } from "@supabase/supabase-js"

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
      "mx-auto flex h-16 w-full flex-row items-center justify-between rounded-md px-4 py-2 shadow-sm"
    ]}>
    <div class="flex flex-row items-center gap-4">
      <Sidebar.Trigger class="-ml-1" />
      <a href="/admin/employees"> Employees </a>
      <a href="/admin/expenses">Expenses</a>
    </div>

    <div class="flex flex-row gap-2">
      {#if session !== null && user !== null}
        <AccountDropdown {session} {user} {supabase} />
      {/if}
      <ColorModeToggle />
    </div>
  </nav>
  <div class="5 h-0 w-full">
    {#if navigating.from}
      <div class="progress h-0.5 bg-freyza-brand-secondary" out:fade={{ duration: 100 }}></div>
    {/if}
  </div>
</header>

<style scoped>
.progress {
  animation-name: progress;
  animation-duration: 2s;
  animation-timing-function: cubic-bezier(0.1, 0.8, 0.2, 1);
  animation-fill-mode: forwards;
  width: 100%;
}

@keyframes progress {
  0% {
    width: 0%;
  }
  25% {
    width: 40%;
  }
  50% {
    width: 80%;
  }
  75% {
    width: 85%;
  }
  95% {
    width: 90%;
  }
  100% {
    width: 90%;
  }
}
</style>
