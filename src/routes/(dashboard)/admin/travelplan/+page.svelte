<script lang="ts">
import PageHeader from "$lib/components/dashboard/PageHeader.svelte"
import AddTravelPlanCard from "$lib/components/dashboard/travelplan/AddTravelPlanCard.svelte"
import TravelPlanCard from "$lib/components/dashboard/travelplan/TravelPlanCard.svelte"
import * as Card from "@ui/card"
import { Skeleton } from "@ui/skeleton"

import { getTravelPlansForMonth } from "$lib/api/travelplan.remote.js"

import { getAllEmployeesCount } from "@/lib/api/employee.remote.js"

import type { TravelPlanFull } from "$lib/types"

let { data } = $props()
let { today, nextMonth, months } = $derived(data)

function isAnyEmployeeLeft(travelPlans: TravelPlanFull[] | undefined, empCount: number) {
  return (travelPlans ?? []).length < empCount
}
</script>

<svelte:head>
  <title>Travel Plans | Freyza Cosmeceuticals Employee System</title>
  <meta name="description" content="Travel Plans for Freyza Cosmeceuticals Employee System" />
</svelte:head>

<div class="h-auto w-full space-y-8 px-4 py-8">
  <PageHeader title="Travel Plans" description="get them tight on schedule" />

  <div class="mx-auto max-w-5xl">
    {#each months as m, i (m.toString())}
      <Card.Root class="w-full gap-2 border-0 bg-transparent shadow-none ring-0">
        <Card.Header>
          <Card.Title class="text-lg font-semibold">
            {m.monthLong}
            {m.year}
            {#if i === 0}
              <span class="font-normal italic"> (Upcoming Month) </span>
            {/if}
          </Card.Title>
        </Card.Header>
        <Card.Content class="flex flex-row flex-wrap items-stretch gap-4">
          <svelte:boundary>
            <!-- pass YYYY-MM-DD format ISODate to the remote query function, same is used there as well -->
            {const travelPlans = $derived(await getTravelPlansForMonth(m.toISODate()))}
            {const empCount = $derived(await getAllEmployeesCount())}
            {#if i === 0 && isAnyEmployeeLeft(travelPlans, empCount)}
              <AddTravelPlanCard month={nextMonth} />
            {/if}

            {#each travelPlans as travelPlan}
              <TravelPlanCard {travelPlan} />
            {:else}
              {#if i !== 0}
                <p class="text-muted-foreground">No Travel Plans for this month</p>
              {/if}
            {/each}

            {#snippet pending()}
              {const skeletonCount = Array.from({ length: i === 0 ? 4 : 5 }, (_, i) => i + 1)}
              {#if i === 0}
                <AddTravelPlanCard month={nextMonth} />
              {/if}
              {#each skeletonCount as item, i (item)}
                <Skeleton class="aspect-video w-32" />
              {/each}
            {/snippet}
            {#snippet failed(error)}
              <p class="text-center text-lg font-medium text-destructive">
                An error occurred while fetching travel plans.
              </p>
            {/snippet}
          </svelte:boundary>
        </Card.Content>
      </Card.Root>
    {/each}
  </div>
</div>
