<script lang="ts">
import { Badge } from "@ui/badge"
import * as Card from "@ui/card"
import { Separator } from "@ui/separator"

import DollarSignIcon from "@lucide/svelte/icons/circle-dollar-sign"
import FileTextIcon from "@lucide/svelte/icons/file-text"
import MapPinIcon from "@lucide/svelte/icons/map-pin"
import TargetIcon from "@lucide/svelte/icons/target"
import TrendingUpIcon from "@lucide/svelte/icons/trending-up"
import TrophyIcon from "@lucide/svelte/icons/trophy"

import type { TravelPlanMetrics, TravelPlanStats } from "$lib/types"

interface Props {
  metrics: TravelPlanMetrics
  stats?: TravelPlanStats | null
}

const { metrics, stats }: Props = $props()

const formatCurrency = (amount: number) => {
  return Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount)
}

const percent = $derived.by(() => {
  if (!metrics.targetAmount || metrics.targetAmount <= 0) return 0
  return (metrics.totalAmount / metrics.targetAmount) * 100
})

const cappedPercent = $derived(Math.min(Math.round(percent), 100))

const statusInfo = $derived.by(() => {
  if (percent >= 100) {
    return {
      label: "Target Achieved",
      colorClass: "text-amber-500",
      bgClass: "bg-amber-500",
      badgeVariant: "default" as const,
      badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
    }
  } else if (percent >= 85) {
    return {
      label: "Near Target",
      colorClass: "text-emerald-500",
      bgClass: "bg-emerald-500",
      badgeVariant: "default" as const,
      badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
    }
  } else if (percent >= 50) {
    return {
      label: "On Track",
      colorClass: "text-blue-500",
      bgClass: "bg-blue-500",
      badgeVariant: "default" as const,
      badgeClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
    }
  } else if (percent >= 15) {
    return {
      label: "In Progress",
      colorClass: "text-amber-600 dark:text-amber-400",
      bgClass: "bg-amber-500",
      badgeVariant: "default" as const,
      badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
    }
  } else {
    return {
      label: "Off Track",
      colorClass: "text-destructive",
      bgClass: "bg-destructive",
      badgeVariant: "destructive" as const,
      badgeClass: ""
    }
  }
})

const reportingRate = $derived(
  stats ? ((metrics.numReports / stats.workDays) * 100).toFixed(0) : "0"
)
const avgVisitsPerReport = $derived(
  metrics.numReports > 0 ? (metrics.numVisits / metrics.numReports).toFixed(1) : "0"
)

const targetDifference = $derived(metrics.totalAmount - metrics.targetAmount)
</script>

<Card.Root class="w-full">
  <Card.Header class="pb-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="space-y-1">
        <Card.Title class="flex items-center gap-2 text-base font-semibold">
          <TargetIcon class="size-4 text-muted-foreground" />
          Monthly Performance & Target Progress
        </Card.Title>
        <Card.Description>Tracking total order amounts against monthly targets</Card.Description>
      </div>
      <div class="flex items-center gap-2">
        <Badge variant={statusInfo.badgeVariant} class={statusInfo.badgeClass}>
          {#if percent >= 100}
            <TrophyIcon class="mr-1 inline size-3" />
          {/if}
          {statusInfo.label}
        </Badge>
      </div>
    </div>
  </Card.Header>

  <Card.Content class="space-y-6">
    <!-- Progress Bar Section -->
    <div class="space-y-2">
      <div class="flex items-center justify-between text-sm font-medium">
        <span class="flex items-center gap-1.5">
          <TrendingUpIcon class="size-4 text-muted-foreground" />
          <span>Sales Progress</span>
        </span>
        <span class="font-mono">
          <strong class="text-xl">{formatCurrency(metrics.totalAmount)}</strong>
          <span class="text-muted-foreground"> / {formatCurrency(metrics.targetAmount)}</span>
        </span>
      </div>

      <!-- Custom-styled Progress Bar -->
      <div class="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
        <div
          class={["h-full transition-all duration-500", statusInfo.bgClass]}
          style="width: {cappedPercent}%">
        </div>
      </div>

      <div class="muted-foreground flex justify-between text-sm">
        <span>
          {#if targetDifference >= 0}
            <span class="text-lg font-medium text-emerald-600 dark:text-emerald-400">
              + {formatCurrency(Math.abs(targetDifference))} surplus achieved
            </span>
          {:else}
            <span>{formatCurrency(Math.abs(targetDifference))} remaining to hit target</span>
          {/if}
        </span>
        <span class="font-mono">{percent.toFixed(1)}% achieved</span>
      </div>
    </div>

    <Separator />

    <!-- Metrics Grid -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <!-- Order Sales -->
      <Card.Root>
        <Card.Header class="flex items-center gap-1.5 text-sm text-muted-foreground">
          <DollarSignIcon class="size-3.5" />
          <span>Total Order Sales</span>
        </Card.Header>
        <Card.Content class="text-xl font-bold">
          {formatCurrency(metrics.totalOrderAmount)}
        </Card.Content>
      </Card.Root>

      <!-- Sales w/o GST -->
      <Card.Root>
        <Card.Header class="flex items-center gap-1.5 text-sm text-muted-foreground">
          <DollarSignIcon class="size-3.5" />
          <span>Collection (w/o GST)</span>
        </Card.Header>
        <Card.Content class="text-xl font-bold">
          {formatCurrency(metrics.totalAmountWithoutGST)}
        </Card.Content>
        <Card.Footer>
          <p class="text-sm text-muted-foreground">net billing</p>
        </Card.Footer>
      </Card.Root>

      <!-- Daily Reports -->
      <Card.Root>
        <Card.Header class="flex items-center gap-1.5 text-sm text-muted-foreground">
          <FileTextIcon class="size-3.5" />
          <span>Reports Submitted</span>
        </Card.Header>
        <Card.Content class="text-xl font-bold">
          {metrics.numReports}
          {#if stats}
            <span class="text-sm font-normal text-muted-foreground">
              / {stats.workDays} planned
            </span>
          {/if}
        </Card.Content>
        <Card.Footer>
          <p class="text-sm text-muted-foreground">
            {#if stats && stats.workDays > 0}
              {reportingRate}% reporting rate
            {:else}
              reports logged
            {/if}
          </p>
        </Card.Footer>
      </Card.Root>

      <!-- Visits Completed -->
      <Card.Root>
        <Card.Header class="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPinIcon class="size-3.5" />
          <span>Visits Logged</span>
        </Card.Header>
        <Card.Content class="text-xl font-bold">
          {metrics.numVisits}
        </Card.Content>
        <Card.Footer>
          <p class="text-sm text-muted-foreground">
            ~{avgVisitsPerReport} visits / report
          </p>
        </Card.Footer>
      </Card.Root>
    </div>
  </Card.Content>
</Card.Root>
