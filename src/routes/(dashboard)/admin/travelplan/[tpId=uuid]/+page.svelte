<script lang="ts">
import { page } from "$app/state"

import ViewPlanCalendar from "$lib/components/dashboard/travelplan/ViewPlanCalendar.svelte"
import * as Avatar from "@ui/avatar"
import { Badge } from "@ui/badge"
import * as Card from "@ui/card"

import { getTravelPlanByIdWithEntries } from "$lib/api/travelplan.remote"
import { DayType } from "$lib/types"

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
            <div class="flex flex-row items-center justify-end gap-3">
              <Avatar.Root class="size-8 shrink-0 self-start">
                <Avatar.Image src="https://github.com/harshnarayanjha.png" />
                <Avatar.Fallback>
                  {travelPlan.employee.name.slice(0, 1)}
                </Avatar.Fallback>
              </Avatar.Root>

              <div class="flex min-w-0 flex-col">
                <span class="font-semibold">
                  {travelPlan.employee.name}
                </span>
                <div class="flex flex-row items-center gap-2">
                  {#if travelPlan.employee.tier}
                    <Badge class="mt-0.5 w-fit px-1.5 py-0 text-xs">
                      {travelPlan.employee.tier.toUpperCase()}
                    </Badge>
                  {/if}

                  {#if travelPlan.employee.hq}
                    <span class="text-sm text-muted-foreground italic">
                      {travelPlan.employee.hq.name}
                    </span>
                  {/if}
                </div>
              </div>
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
