<script lang="ts">
import { page } from "$app/state"

import ViewPlanCalendar from "@/components/dashboard/travelplan/ViewPlanCalendar.svelte"
import * as Card from "@/components/ui/card"

import { getTravelPlanByIdWithEntries } from "@/api/travelplan.remote.js"
import { DayType } from "@db/browser"

import { DateTime } from "luxon"

let { data } = $props()
let { user } = $derived(data)

const tpId = $derived(page.params.tpId!)

const dayTypes = [DayType.WORK, DayType.LEAVE, DayType.HOLIDAY]

const travelPlan = $derived(await getTravelPlanByIdWithEntries(tpId))
const tpMonth = $derived(travelPlan ? DateTime.fromJSDate(travelPlan.month) : null)

$inspect(tpId).with(console.log)
</script>

<svelte:head>
  <title>Travel Plan | Freyza Cosmeceuticals Employee System</title>
  <meta name="description" content="Travel Plan for Freyza Cosmeceuticals Employee System" />
</svelte:head>

<div class="h-auto w-full space-y-8 px-4 py-8">
  {#if travelPlan}
    {@const month = tpMonth!}
    <Card.Root class="w-full border-0 bg-transparent shadow-none">
      <Card.Header>
        <Card.Title class="text-2xl">Travel Plan</Card.Title>
        <Card.Description></Card.Description>
      </Card.Header>
    </Card.Root>
    <div class="mx-auto max-w-5xl">
      <Card.Root class="w-full">
        <Card.Header>
          <Card.Title class="text-xl font-bold">
            {month.monthLong}
            {month.year}
          </Card.Title>
          <Card.Action>
            <div class="flex flex-col items-end justify-center gap-2">
              {travelPlan.employee.name}
            </div>
          </Card.Action>
        </Card.Header>
        <Card.Content class="space-y-4">
          <ViewPlanCalendar {month} {dayTypes} planEntries={travelPlan.planEntries} />
        </Card.Content>
        <Card.Footer></Card.Footer>
      </Card.Root>
    </div>
  {:else}
    <Card.Root class="w-full border-0 bg-transparent shadow-none">
      <Card.Header>
        <Card.Title class="text-2xl">Travel Plan Not Found</Card.Title>
        <Card.Description>404 Not Found</Card.Description>
      </Card.Header>
    </Card.Root>
  {/if}
</div>
