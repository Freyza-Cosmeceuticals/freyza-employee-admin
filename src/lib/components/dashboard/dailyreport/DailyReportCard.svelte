<script lang="ts">
import { resolve } from "$app/paths"

import { Badge } from "@ui/badge"
import * as Card from "@ui/card"
import { Separator } from "@ui/separator"

import { fetchRoutes } from "$lib/api/route.remote"
import { DayType } from "$lib/types"

import { dayTypeBadge, routeBadge } from "../snippets.svelte"
import UserCard from "../UserCard.svelte"
import type { DailyReportFull, EmployeeWithHQ, RouteWithName } from "$lib/types"

interface Props {
  dailyReport: DailyReportFull
}

const { dailyReport }: Props = $props()

let routes = $state<RouteWithName[] | null>(null)
routes = await fetchRoutes()

let reportRoute = $derived(routes?.find((it) => it.id == dailyReport?.routeId) ?? null)

let dailyReportUrl = $derived.by(() => {
  return resolve(`/admin/dailyreport/${dailyReport.id}`)
})
</script>

<Card.Root class="w-auto min-w-80 p-3">
  <Card.Content class="flex flex-col gap-4 p-1">
    <!-- User Card -->
    <UserCard
      user={dailyReport.employee as EmployeeWithHQ}
      actionUrl={dailyReportUrl}
      actionLabel="View Report"
      compact />
    <Separator />
    <div class="flex items-center gap-2">
      {@render dayTypeBadge(dailyReport.dayType)}
      {#if dailyReport.dayType == DayType.WORK}
        {@render routeBadge(reportRoute, "w-min")}
      {/if}
      <Badge>
        {dailyReport.locked ? "LOCKED" : "UNLOCKED"}
      </Badge>
      {#if dailyReport.locked == true}
        <small>{dailyReport.lockedAt}</small>
      {/if}
    </div>
  </Card.Content>
</Card.Root>
