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

const formatCurrency = (amount: number) => {
  return Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount)
}

const percent = $derived.by(() => {
  if (!travelPlan.metrics?.targetAmount || travelPlan.metrics.targetAmount <= 0) return 0
  return (travelPlan.metrics.totalAmount / travelPlan.metrics.targetAmount) * 100
})

const cappedPercent = $derived(Math.min(Math.round(percent), 100))

const statusColor = $derived.by(() => {
  if (percent >= 100) return { text: "text-amber-500", bg: "bg-amber-500" }
  if (percent >= 85) return { text: "text-emerald-500", bg: "bg-emerald-500" }
  if (percent >= 50) return { text: "text-blue-500", bg: "bg-blue-500" }
  if (percent >= 15) return { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500" }
  return { text: "text-destructive", bg: "bg-destructive" }
})
</script>

<Card.Root class="w-auto">
  <Card.Header>
    {#if travelPlan.employee}
      <UserCard
        user={travelPlan.employee}
        actionUrl={travelPlanUrl}
        actionLabel="View Plan"
        compact />
    {:else}
      <Skeleton class="h-12 w-full" />
    {/if}
  </Card.Header>

  <Card.Content class="flex flex-col gap-4 p-4">
    {#if travelPlan.metrics}
      <div class="flex items-center justify-between text-sm font-medium">
        <span class="text-muted-foreground">Target Progress</span>
        <span class="font-mono">
          <strong class="text-xl">
            {formatCurrency(travelPlan.metrics.totalAmount)}
          </strong>
          <span class="text-sm text-muted-foreground">
            / {formatCurrency(travelPlan.metrics.targetAmount)}
          </span>
        </span>
      </div>

      <div class="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
        <div
          class={["h-full transition-all duration-300", statusColor.bg]}
          style="width: {cappedPercent}%">
        </div>
      </div>

      <div class="flex items-center justify-between text-sm text-muted-foreground">
        <span>{percent.toFixed(0)}% achieved</span>
        <span>{travelPlan.metrics.numVisits} visits ({travelPlan.metrics.numReports} reports)</span>
      </div>
    {/if}
  </Card.Content>
  <Card.Footer class="mx-auto p-4">
    <!-- Stats -->
    <div class="flex gap-2">
      {@render statsBadge(DayType.WORK, travelPlan.stats?.workDays ?? 0)}
      {@render statsBadge(DayType.HOLIDAY, travelPlan.stats?.holidayDays ?? 0)}
      {@render statsBadge(DayType.LEAVE, travelPlan.stats?.leaveDays ?? 0)}
    </div>
  </Card.Footer>
</Card.Root>
