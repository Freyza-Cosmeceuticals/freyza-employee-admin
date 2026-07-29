<script lang="ts">
import { resolve } from "$app/paths"
import { page } from "$app/state"

import ViewPlanCalendar from "$lib/components/dashboard/travelplan/ViewPlanCalendar.svelte"
import * as Avatar from "@ui/avatar"
import { Badge } from "@ui/badge"
import * as Card from "@ui/card"

import { getTravelPlanByIdWithEntries } from "$lib/api/travelplan.remote"
import { DayType } from "$lib/types"

import PageHeader from "@/lib/components/dashboard/PageHeader.svelte"
import ArrowLeft from "@lucide/svelte/icons/arrow-left"
import { DateTime } from "luxon"

let { data } = $props()
let { claims } = $derived(data)

const tpId = $derived(page.params.tpId!)

const dayTypes = [DayType.WORK, DayType.LEAVE, DayType.HOLIDAY]

const travelPlan = $derived(await getTravelPlanByIdWithEntries(tpId))
const month = $derived(travelPlan ? DateTime.fromJSDate(travelPlan.month) : null)

$inspect(tpId).with(console.log)
</script>

<svelte:head>
  <title>Travel Plan | Freyza Cosmeceuticals Employee System</title>
  <meta name="description" content="Travel Plan for Freyza Cosmeceuticals Employee System" />
</svelte:head>

<div class="h-auto w-full space-y-8 px-4 py-8">
  {#if travelPlan && month}
    {#snippet subheader()}
      <a
        href={resolve("/admin/travelplan")}
        class="text-muted-foreground transition-colors hover:text-foreground/80">
        <span class="flex items-center gap-1">
          <ArrowLeft class="inline size-4" />
          All Travel Plans
        </span>
      </a>
    {/snippet}

    <PageHeader title="Travel Plan" description="" {subheader} />
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
                <Avatar.Image
                  src="https://api.dicebear.com/10.x/lorelei/svg?seed={travelPlan.employee.id.substring(
                    0,
                    6
                  )}" />
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
    <PageHeader title="Travel Plan Not Found" description="404 Not Found" />
  {/if}
</div>
