<script lang="ts">
import DailyReportCard from "$lib/components/dashboard/dailyreport/DailyReportCard.svelte"
import * as Card from "@ui/card"
import { Skeleton } from "@ui/skeleton"

import { getDailyReportsForDate } from "$lib/api/dailyreport.remote"

import { DateTime } from "luxon"

import type { DailyReportWithEmployee } from "$lib/types"

let { data } = $props()
let { today, days, employeeCount } = $derived(data)

function employeesRemaining(dailyReports: DailyReportWithEmployee[], empCount: number) {
  return Math.max(0, empCount - dailyReports.length)
}
</script>

<svelte:head>
  <title>Daily Reports | Freyza Cosmeceuticals Employee System</title>
  <meta name="description" content="Daily Reports for Freyza Cosmeceuticals Employee System" />
</svelte:head>

<div class="h-auto w-full space-y-8 px-4 py-8">
  <Card.Root class="w-full border-0 bg-transparent shadow-none">
    <Card.Header>
      <Card.Title class="text-2xl">Daily Reports</Card.Title>
      <Card.Description>see how the progress is going</Card.Description>
    </Card.Header>
  </Card.Root>

  <div class="mx-auto max-w-5xl">
    {#each days as d, i (d.toString())}
      <Card.Root class="w-full gap-2 border-0 bg-transparent shadow-none">
        <Card.Header>
          <Card.Title class="text-lg font-semibold">
            {d.toLocaleString(DateTime.DATE_MED)}
            {#if i === 0}
              <span class="font-normal italic"> (Today) </span>
            {/if}
          </Card.Title>
        </Card.Header>
        <Card.Content class="flex flex-row flex-wrap items-stretch gap-4">
          <svelte:boundary>
            <!-- pass YYYY-MM-DD format ISODate to the remote query function, same is used there as well -->
            {@const dailyReports = (await getDailyReportsForDate(d.toISODate())) ?? []}
            {@const empCount = employeeCount.data ?? 0}

            {#each dailyReports as dailyReport}
              <DailyReportCard {dailyReport} />
            {:else}
              <p class="text-muted-foreground">No reports submitted for this date</p>
            {/each}

            {#if dailyReports.length !== 0 && employeesRemaining(dailyReports, empCount) > 0}
              <div
                class="ms-8 aspect-square w-28 self-center rounded-full border border-dashed border-sidebar-accent-foreground/45 bg-sidebar-accent/50 p-4 text-center">
                <span class="text-xl font-medium">
                  {employeesRemaining(dailyReports, empCount)}
                </span>
                <p class="text-muted-foreground">report remains</p>
              </div>
            {/if}

            {#snippet pending()}
              {@const skeletonCount = Array.from({ length: i === 0 ? 4 : 5 }, (_, i) => i + 1)}

              {#each skeletonCount as item, i (item)}
                <Skeleton class="aspect-video w-32" />
              {/each}
            {/snippet}
            {#snippet failed(error)}
              <p class="text-center text-lg font-medium text-destructive">
                An error occurred while fetching daily reports.
              </p>
            {/snippet}
          </svelte:boundary>
        </Card.Content>
      </Card.Root>
    {/each}
  </div>
</div>
