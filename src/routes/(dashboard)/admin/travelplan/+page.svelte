<script lang="ts">
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import * as Card from "@/components/ui/card"
import { resolve } from "$app/paths"
import AddTravelPlanCard from "@/components/dashboard/travelplan/AddTravelPlanCard.svelte"

let { data } = $props()
let { travelPlans, today } = $derived(data)

const nextMonth = $derived(today.plus({ months: 1 }))
const months = $derived.by(() => {
  let m = []
  // first next month
  m.push(nextMonth)

  for (let i = 0; i < 3; i++) {
    m.push(today.minus({ months: i }))
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
      <!-- <Card.Action>
        <Button href={resolve("/admin/travelplan/create")}>
          <CalendarPlusIcon />
          Create Travel Plan
        </Button>
      </Card.Action> -->
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
              <span class="font-normal italic"> (Next Month) </span>
            {/if}
          </Card.Title>
        </Card.Header>
        <Card.Content class="flex flex-row flex-wrap">
          {#await travelPlans}
            {#each [1, 2, 3, 4, 5] as item, i (item)}
              <Skeleton class="m-4 h-32 w-56" />
            {/each}
          {:then data}
            {#if i === 0}
              <AddTravelPlanCard />
            {/if}
            <br />

            <!-- .getMonth() is JS Date (0-11), m.month is luxon DateTime (1-12) -->
            {JSON.stringify(data.filter((tp) => tp.month.getMonth() === m.month - 1))}
          {:catch error}
            <p class="text-center text-lg font-medium text-gray-500">
              An error occurred while fetching travel plans.
            </p>
          {/await}
        </Card.Content>
      </Card.Root>
    {/each}
  </div>
</div>
