<script lang="ts">
import { resolve } from "$app/paths"

import * as Avatar from "@ui/avatar"
import { Badge } from "@ui/badge"
import * as Card from "@ui/card"
import { Separator } from "@ui/separator"

import { DayType } from "$lib/types"

import { statsBadge } from "./snippets.svelte"
import type { TravelPlanWithEmployee } from "$lib/types"

interface Props {
  travelPlan: TravelPlanWithEmployee
}

const { travelPlan }: Props = $props()

let travelPlanUrl = $derived.by(() => {
  const dt = `${(travelPlan.month.getMonth() + 1).toString().padStart(2, "0")}-${travelPlan.month.getFullYear()}`
  return resolve(`/admin/travelplan/${dt}?employeeId=${travelPlan.employee.id}`)
})
</script>

<Card.Root class="w-auto p-3">
  <Card.Content class="flex flex-col gap-4 p-1">
    <!-- Header -->
    <div class="flex w-full flex-row items-center justify-start gap-3">
      <Avatar.Root class="size-8 shrink-0">
        <Avatar.Image src="https://github.com/harshnarayanjha.png" />
        <Avatar.Fallback>
          {travelPlan.employee.name.slice(0, 1)}
        </Avatar.Fallback>
      </Avatar.Root>

      <div class="flex min-w-0 flex-col">
        <span
          class="truncate text-base leading-tight font-semibold"
          title={travelPlan.employee.name}>
          {travelPlan.employee.name}
        </span>

        <div class="flex flex-row items-center gap-2">
          {#if travelPlan.employee.tier}
            <Badge class="mt-0.5 w-fit px-1.5 py-0 text-xs">
              {travelPlan.employee.tier.toUpperCase()}
            </Badge>
          {/if}

          {#if travelPlan.employee.hq}
            <span class="text-sm text-muted-foreground italic">
              {travelPlan.employee.hq.name}
            </span>
          {/if}
        </div>
      </div>

      <a href={travelPlanUrl} class="ms-auto self-start text-sm hover:underline"> View Plan </a>
    </div>
    <Separator />
  </Card.Content>
  <Card.Footer>
    <!-- Stats -->
    <div class="flex gap-2">
      {@render statsBadge(DayType.WORK, travelPlan.stats?.workDays ?? 0)}
      {@render statsBadge(DayType.HOLIDAY, travelPlan.stats?.holidayDays ?? 0)}
      {@render statsBadge(DayType.LEAVE, travelPlan.stats?.leaveDays ?? 0)}
    </div>
  </Card.Footer>
</Card.Root>
