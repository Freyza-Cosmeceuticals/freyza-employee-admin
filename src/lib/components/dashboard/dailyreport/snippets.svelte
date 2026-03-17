<script module lang="ts">
import { Badge } from "@ui/badge"
import * as ButtonGroup from "@ui/button-group"

import { DayType, VisitType } from "$lib/types"

import type { RouteWithName } from "$lib/types"

export { dayTypeBadge, routeBadge, statsBadge }
</script>

{#snippet dayTypeBadge(dt: DayType)}
  {#if dt == DayType.WORK}
    <Badge variant="default" class="rounded-sm">WORK</Badge>
  {:else if dt == DayType.LEAVE}
    <Badge class="rounded-sm bg-freyza-badge-leave">LEAVE</Badge>
  {:else if dt == DayType.HOLIDAY}
    <Badge class="rounded-sm bg-freyza-badge-holiday">HOLIDAY</Badge>
  {:else}
    <Badge variant="outline" class="rounded-sm">UNKNOWN</Badge>
  {/if}
{/snippet}

{#snippet visitTypeBadge(vt: VisitType)}
  {#if vt == VisitType.DOCTOR}
    <Badge variant="default" class="rounded-sm">DOCTOR</Badge>
  {:else if vt == VisitType.CHEMIST}
    <Badge variant="default" class="rounded-sm">CHEMIST</Badge>
  {:else if vt == VisitType.STOCKIST}
    <Badge variant="default" class="rounded-sm">STOCKIST</Badge>
  {:else}
    <Badge variant="outline" class="rounded-sm">UNKNOWN</Badge>
  {/if}
{/snippet}

{#snippet routeBadge(route: RouteWithName | null, className: String = "")}
  {#if route}
    <Badge class={["w-full rounded-sm bg-freyza-route", className]}>
      {`${route.srcLoc.name} → ${route.destLoc.name}`}
    </Badge>
  {:else}
    <Badge variant="destructive" class={["w-full rounded-sm bg-freyza-invalid-route", className]}
      >NO ROUTE</Badge>
  {/if}
{/snippet}

{#snippet statsBadge(type: VisitType, value: number, big: boolean = false)}
  <ButtonGroup.Root>
    {@render visitTypeBadge(type)}
    <ButtonGroup.Text>
      <span class={["font-mono text-sm font-medium", big && "text-xl"]}>
        {value.toString().padStart(2, "0")}
      </span>
    </ButtonGroup.Text>
  </ButtonGroup.Root>
{/snippet}
