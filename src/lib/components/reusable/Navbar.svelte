<script lang="ts">
import { dev } from "$app/environment"
import { page } from "$app/state"

import { Badge } from "@ui/badge"
import { buttonVariants } from "@ui/button"

import AccountDropdown from "./AccountDropdown.svelte"
import ColorModeToggle from "./ColorModeToggle.svelte"
import type { JwtPayload, Session, SupabaseClient } from "@supabase/supabase-js"

interface Props {
  session: Session | null
  claims: JwtPayload | null
  supabase: SupabaseClient
  deploymentGitBranch?: string
}

const { session, claims, supabase, deploymentGitBranch }: Props = $props()
</script>

<!-- Frontpage Navbar -->
<header>
  <nav
    class={[
      "mx-auto my-2 flex h-16 w-full flex-row items-center justify-between rounded-md px-4 py-2 shadow-sm md:w-1/2"
    ]}>
    <div>
      <a href="/">
        <span class="font-semibold">Freyza Cosmeceuticals</span>
        | Employee
      </a>
    </div>

    <div class="flex flex-row gap-2">
      {#if dev}
        <Badge variant="outline" class="bg-accent">DEV MODE</Badge>
      {:else if deploymentGitBranch && deploymentGitBranch != "main"}
        <Badge variant="outline" class="bg-accent" title="Deployed from branch">
          {deploymentGitBranch?.toUpperCase()}
        </Badge>
      {/if}
      <!-- Make sure to not show Login button on login page -->
      {#if page.url.pathname !== "/auth"}
        {#if session !== null && claims !== null}
          <AccountDropdown {session} {claims} {supabase} />
        {:else}
          <a
            href="/auth"
            class={buttonVariants({ variant: "outline", size: "sm", class: "h-auto" })}>
            Login
          </a>
        {/if}
      {/if}
      <ColorModeToggle />
    </div>
  </nav>
</header>
