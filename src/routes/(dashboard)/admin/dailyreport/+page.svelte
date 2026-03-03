<script lang="ts">
import DailyReportCard from "$lib/components/dashboard/dailyreport/DailyReportCard.svelte"
import * as Card from "@ui/card"
import { Skeleton } from "@ui/skeleton"

import { getDailyReportsForDate } from "$lib/api/dailyreport.remote"

import { DateTime } from "luxon"

import type { DailyReportWithEmployee } from "$lib/types"

let { data } = $props()
let { today, days, employeeCount } = $derived(data)

function isAnyEmployeeLeft(
  dailyReports: DailyReportWithEmployee[] | undefined,
  empCount: number | null
) {
  // we aren't sure, so say yes
  if (empCount === null) return true

  return (dailyReports ?? []).length < empCount
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
            {@const dailyReports = await getDailyReportsForDate(d.toISODate())}
            {@const empCount = await employeeCount}

            {#each dailyReports as dailyReport}
              <DailyReportCard {dailyReport} />
            {:else}
              <p class="text-muted-foreground">No Daily Reports for this date</p>
            {/each}

            {#if (dailyReports ?? []).length !== 0 && isAnyEmployeeLeft(dailyReports, empCount.data)}
              Employees remaining...
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
