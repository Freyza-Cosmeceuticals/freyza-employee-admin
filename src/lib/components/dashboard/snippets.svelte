<script module lang="ts">
import { Badge } from "@ui/badge"
import * as ButtonGroup from "@ui/button-group"

import { DayType, VisitType } from "$lib/types"

import ArrowRight from "@lucide/svelte/icons/arrow-right"

import type { RouteWithName } from "$lib/types"
import type { ClassValue } from "svelte/elements"

export { dayTypeBadge, routeBadge, statsBadge, visitTypeBadge }
</script>

{#snippet dayTypeBadge(dt: DayType)}
  {#if dt == DayType.WORK}
    <Badge variant="default" class="h-auto rounded-sm bg-freyza-badge-work">WORK</Badge>
  {:else if dt == DayType.LEAVE}
    <Badge variant="default" class="h-auto rounded-sm bg-freyza-badge-leave">LEAVE</Badge>
  {:else if dt == DayType.HOLIDAY}
    <Badge class="h-auto rounded-sm bg-freyza-badge-holiday">HOLIDAY</Badge>
  {:else}
    <Badge variant="outline" class="h-auto rounded-sm">???</Badge>
  {/if}
{/snippet}

{#snippet visitTypeBadge(vt: VisitType)}
  {#if vt == VisitType.DOCTOR}
    <Badge variant="default" class="h-auto rounded-sm">DOCTOR</Badge>
  {:else if vt == VisitType.CHEMIST}
    <Badge variant="default" class="h-auto rounded-sm">CHEMIST</Badge>
  {:else if vt == VisitType.STOCKIST}
    <Badge variant="default" class="h-auto rounded-sm">STOCKIST</Badge>
  {:else}
    <Badge variant="outline" class="h-auto rounded-sm">???</Badge>
  {/if}
{/snippet}

{#snippet routeBadge(route: RouteWithName | null, className: ClassValue = "")}
  {#if route}
    <Badge class="h-auto w-full rounded-sm bg-freyza-route {className}">
      {route.srcLoc.name.substring(0, 4).toUpperCase()}
      <ArrowRight class="mx-1 size-4" />
      {route.destLoc.name.substring(0, 4).toUpperCase()}
    </Badge>
  {:else}
    <Badge variant="destructive" class="h-auto w-full rounded-sm {className}">NO ROUTE</Badge>
  {/if}
{/snippet}

{#snippet statsBadge(type: VisitType | DayType, value: number, big: boolean = false)}
  <ButtonGroup.Root>
    {#if Object.values(VisitType).includes(type as VisitType)}
      {@render visitTypeBadge(type as VisitType)}
    {:else if Object.values(DayType).includes(type as DayType)}
      {@render dayTypeBadge(type as DayType)}
    {/if}
    <ButtonGroup.Text>
      <span class={["font-mono text-sm font-medium", big && "text-xl"]}>
        {value.toString().padStart(2, "0")}
      </span>
    </ButtonGroup.Text>
  </ButtonGroup.Root>
{/snippet}
