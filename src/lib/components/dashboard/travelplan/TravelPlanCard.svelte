<script lang="ts">
import { resolve } from "$app/paths"

import * as Card from "@ui/card"

import { DayType } from "$lib/types"

import { statsBadge } from "../snippets.svelte"
import UserCard from "../UserCard.svelte"
import type { TravelPlanWithEmployee } from "$lib/types"

interface Props {
  travelPlan: TravelPlanWithEmployee
}

const { travelPlan }: Props = $props()

let travelPlanUrl = $derived.by(() => {
  const dt = `${travelPlan.month.getFullYear()}-${(travelPlan.month.getMonth() + 1).toString().padStart(2, "0")}`
  return resolve(`/admin/travelplan/${dt}?employeeId=${travelPlan.employee.id}`)
})
</script>

<Card.Root class="w-auto">
  <Card.Content class="flex flex-col gap-4 p-2">
    <UserCard
      user={travelPlan.employee}
      actionUrl={travelPlanUrl}
      actionLabel="View Plan"
      compact />
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
