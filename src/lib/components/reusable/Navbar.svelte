<script lang="ts">
import { page } from "$app/state"
import type { Session, SupabaseClient } from "@supabase/supabase-js"
import { buttonVariants } from "@/components/ui/button"
import ColorModeToggle from "./ColorModeToggle.svelte"
import type { User } from "@supabase/supabase-js"
import AccountDropdown from "./AccountDropdown.svelte"

interface Props {
  session: Session | null
  user: User | null
  supabase: SupabaseClient
}

const { session, user, supabase }: Props = $props()
</script>

<!-- Frontpage Navbar -->
<header>
  <nav
    class={[
      "mx-auto my-2 flex h-16 w-full flex-row items-center justify-between rounded-md px-4 py-2 shadow-sm md:w-1/2",
    ]}
  >
    <div>
      <a href="/">
        <span class="font-semibold">Freyza Cosmeceuticals</span>
        | Employee
      </a>
    </div>

    <div class="flex flex-row gap-2">
      <!-- Make sure to not show Login button on login page -->
      {#if page.url.pathname !== "/auth"}
        {#if session !== null && user !== null}
          <AccountDropdown {session} {user} {supabase} />
        {:else}
          <a
            href="/auth"
            class={buttonVariants({ variant: "outline", size: "sm", class: "h-auto" })}
          >
            Login
          </a>
        {/if}
      {/if}
      <ColorModeToggle />
    </div>
  </nav>
</header>
