<script lang="ts">
import { getTravelPlansForMonth } from "@/api/travelplan.remote.js"
import AddTravelPlanCard from "@/components/dashboard/travelplan/AddTravelPlanCard.svelte"
import TravelPlanCard from "@/components/dashboard/travelplan/TravelPlanCard.svelte"
import * as Card from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

let { data } = $props()
let { today } = $derived(data)

const nextMonth = $derived(today.plus({ months: 1 }).startOf("month"))
const months = $derived.by(() => {
  let m = []
  // first next month
  m.push(nextMonth)

  for (let i = 0; i < 3; i++) {
    m.push(today.minus({ months: i }).startOf("month"))
  }
  return m
})
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
      <Card.Root class="w-full border-0 bg-transparent shadow-none">
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
          {#if i === 0}
            <AddTravelPlanCard />
          {/if}

          <!-- pass YYYY-MM-DD format ISODate to the remote query function, same is used there as well -->
          {#await getTravelPlansForMonth(m.toISODate())}
            {@const skeletonCount = Array.from({ length: i === 0 ? 4 : 5 }, (_, i) => i + 1)}
            {#each skeletonCount as item, i (item)}
              <Skeleton class="aspect-video w-32" />
            {/each}
          {:then data}
            <!-- .getMonth() is JS Date (0-11), m.month is luxon DateTime (1-12) -->
            {@const tps = data?.filter((tp) => tp.month.getMonth() === m.month - 1) ?? []}

            {#each tps as travelPlan}
              <TravelPlanCard {travelPlan} />
            {:else}
              <p class="text-muted-foreground">No Travel Plans for this month</p>
            {/each}
          {:catch error}
            <p class="text-center text-lg font-medium text-destructive">
              An error occurred while fetching travel plans.
            </p>
          {/await}
        </Card.Content>
      </Card.Root>
    {/each}
  </div>
</div>
