<script lang="ts">
import AddTravelPlanCard from "$lib/components/dashboard/travelplan/AddTravelPlanCard.svelte"
import TravelPlanCard from "$lib/components/dashboard/travelplan/TravelPlanCard.svelte"
import * as Card from "@ui/card"
import { Skeleton } from "@ui/skeleton"

import { getTravelPlansForMonth } from "$lib/api/travelplan.remote.js"

import type { TravelPlanWithEmployee } from "$lib/types"

let { data } = $props()
let { today, nextMonth, months, employeeCount } = $derived(data)

function isAnyEmployeeLeft(
  travelPlans: TravelPlanWithEmployee[] | undefined,
  empCount: number | null
) {
  // we aren't sure, so say yes
  if (empCount === null) return true

  return (travelPlans ?? []).map((tp) => tp.employeeId).length < empCount
}
</script>

<svelte:head>
  <title>Travel Plans | Freyza Cosmeceuticals Employee System</title>
  <meta name="description" content="Travel Plans for Freyza Cosmeceuticals Employee System" />
</svelte:head>

<div class="h-auto w-full space-y-8 px-4 py-8">
  <Card.Root class="w-full border-0 bg-transparent shadow-none">
    <Card.Header>
      <Card.Title class="text-2xl">Travel Plans</Card.Title>
      <Card.Description>get them tight on schedule</Card.Description>
    </Card.Header>
  </Card.Root>

  <div class="mx-auto max-w-5xl">
    {#each months as m, i (m.toString())}
      <Card.Root class="w-full gap-2 border-0 bg-transparent shadow-none">
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
            {@const travelPlans = await getTravelPlansForMonth(m.toISODate())}
            {@const empCount = await employeeCount}
            {#if i === 0 && isAnyEmployeeLeft(travelPlans, empCount.data)}
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
              {@const skeletonCount = Array.from({ length: i === 0 ? 4 : 5 }, (_, i) => i + 1)}
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
