<script module lang="ts">
import { resolve } from "$app/paths"

import { Badge } from "@ui/badge"
import { buttonVariants } from "@ui/button"

import { DayType } from "@/lib/constants"
import EyeIcon from "@lucide/svelte/icons/eye"

export { dayTypeCell, statusCell, actionCell }
</script>

{#snippet dayTypeCell({ dayType }: { dayType: DayType })}
  {#if dayType === DayType.WORK}
    <Badge variant="default" class="rounded-sm bg-freyza-badge-work">WORK</Badge>
  {:else if dayType === DayType.LEAVE}
    <Badge class="rounded-sm bg-freyza-badge-leave">LEAVE</Badge>
  {:else if dayType === DayType.HOLIDAY}
    <Badge class="rounded-sm bg-freyza-badge-holiday">HOLIDAY</Badge>
  {:else}
    <Badge variant="outline" class="rounded-sm">UNKNOWN</Badge>
  {/if}
{/snippet}

{#snippet statusCell({ locked }: { locked: boolean })}
  {#if locked}
    <Badge>LOCKED</Badge>
  {:else}
    <Badge variant="outline">UNLOCKED</Badge>
  {/if}
{/snippet}

{#snippet actionCell({ reportId }: { reportId: string })}
  <a
    href={resolve(`/admin/dailyreport/${reportId}`)}
    class={buttonVariants({ variant: "outline", size: "sm" })}>
    <EyeIcon /> View
  </a>
{/snippet}
