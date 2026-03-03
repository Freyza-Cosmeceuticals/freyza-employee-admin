<script lang="ts">
import { page } from "$app/state"

import * as Avatar from "@ui/avatar"
import { Badge } from "@ui/badge"
import * as Card from "@ui/card"

import { getDailyReportByIdWithVisits } from "$lib/api/dailyreport.remote"
import { DayType } from "$lib/types"

import { DateTime } from "luxon"

let { data } = $props()
let { user } = $derived(data)

const reportId = $derived(page.params.reportId!)

const dayTypes = [DayType.WORK, DayType.LEAVE, DayType.HOLIDAY]

const dailyReport = $derived(await getDailyReportByIdWithVisits(reportId))
const reportDate = $derived(dailyReport ? DateTime.fromJSDate(dailyReport.date) : null)

$inspect(reportId).with(console.log)
</script>

<svelte:head>
  <title>Daily Report | Freyza Cosmeceuticals Employee System</title>
  <meta name="description" content="Daily Report for Freyza Cosmeceuticals Employee System" />
</svelte:head>

<div class="h-auto w-full space-y-8 px-4 py-8">
  {#if dailyReport}
    {@const date = reportDate!}
    <Card.Root class="w-full border-0 bg-transparent shadow-none">
      <Card.Header>
        <Card.Title class="text-2xl">Daily Report</Card.Title>
        <Card.Description></Card.Description>
      </Card.Header>
    </Card.Root>
    <div class="mx-auto max-w-5xl">
      <Card.Root class="w-full">
        <Card.Header>
          <Card.Title class="text-xl font-bold">
            {date.toLocaleString(DateTime.DATE_MED)}
          </Card.Title>
          <Card.Action>
            <div class="flex flex-row items-center justify-end gap-3">
              <Avatar.Root class="size-8 shrink-0 self-start">
                <Avatar.Image src="https://github.com/harshnarayanjha.png" />
                <Avatar.Fallback>
                  {dailyReport.employee.name.slice(0, 1)}
                </Avatar.Fallback>
              </Avatar.Root>

              <div class="flex min-w-0 flex-col">
                <span class="font-semibold">
                  {dailyReport.employee.name}
                </span>
                <div class="flex flex-row items-center gap-2">
                  {#if dailyReport.employee.tier}
                    <Badge class="mt-0.5 w-fit px-1.5 py-0 text-xs">
                      {dailyReport.employee.tier.toUpperCase()}
                    </Badge>
                  {/if}

                  {#if dailyReport.employee.hq}
                    <span class="text-sm text-muted-foreground italic">
                      {dailyReport.employee.hq.name}
                    </span>
                  {/if}
                </div>
              </div>
            </div>
          </Card.Action>
        </Card.Header>
        <Card.Content class="space-y-4">
          <p>
            Did {dailyReport.visits.length} visits in total
          </p>
        </Card.Content>
        <Card.Footer></Card.Footer>
      </Card.Root>
    </div>
  {:else}
    <Card.Root class="w-full border-0 bg-transparent shadow-none">
      <Card.Header>
        <Card.Title class="text-2xl">Daily Report Not Found</Card.Title>
        <Card.Description>404 Not Found</Card.Description>
      </Card.Header>
    </Card.Root>
  {/if}
</div>
