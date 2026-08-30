<script lang="ts">
import { resolve } from "$app/paths"

import * as Card from "@ui/card"
import { Skeleton } from "@ui/skeleton"

import { DayType } from "$lib/types"

import { statsBadge } from "../snippets.svelte"
import UserCard from "../UserCard.svelte"
import type { TravelPlanFull } from "$lib/types"

interface Props {
  travelPlan: TravelPlanFull
}

const { travelPlan }: Props = $props()

let travelPlanUrl = $derived.by(() => {
  const dt = `${travelPlan.month.getFullYear()}-${(travelPlan.month.getMonth() + 1).toString().padStart(2, "0")}`
  if (!travelPlan.employee) return resolve(`/admin/travelplan/${travelPlan.id}`)
  return resolve(`/admin/travelplan/${dt}?employeeId=${travelPlan.employee?.id}`)
})
</script>

<Card.Root class="w-auto">
  <Card.Content class="flex flex-col gap-4 p-2">
    {#if travelPlan.employee}
      <UserCard
        user={travelPlan.employee}
        actionUrl={travelPlanUrl}
        actionLabel="View Plan"
        compact />
    {:else}
      <Skeleton class="h-12 w-full" />
    {/if}
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
