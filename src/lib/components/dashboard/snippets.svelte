<script module lang="ts">
import { Badge } from "@ui/badge"
import * as ButtonGroup from "@ui/button-group"

import { DayType, VisitType } from "$lib/types"

import ArrowRight from "@lucide/svelte/icons/arrow-right"

import type { RouteWithName } from "$lib/types"
import type { ClassValue } from "svelte/elements"

export { dayTypeBadge, routeBadge, statsBadge }
</script>

{#snippet dayTypeBadge(dt: DayType)}
  {#if dt == DayType.WORK}
    <Badge variant="default" class="rounded-sm bg-freyza-badge-work">WORK</Badge>
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

{#snippet routeBadge(route: RouteWithName | null, className: ClassValue = "")}
  {#if route}
    <Badge class={["w-full rounded-sm bg-freyza-route", className]}>
      {route.srcLoc.name.substring(0, 3).toUpperCase()}
      <ArrowRight class="mx-1 size-3" />
      {route.destLoc.name.substring(0, 3).toUpperCase()}
    </Badge>
  {:else}
    <Badge variant="destructive" class={["w-full rounded-sm", className]}>NO ROUTE</Badge>
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
