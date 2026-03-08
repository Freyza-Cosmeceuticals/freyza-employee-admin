<script lang="ts">
import { page } from "$app/state"

import * as Card from "@ui/card"

import { getDailyReportByIdWithVisits } from "$lib/api/dailyreport.remote"
import { DayType, VisitType } from "$lib/types"

import {
  dayTypeBadge,
  routeBadge,
  statsBadge
} from "@/lib/components/dashboard/dailyreport/snippets.svelte"
import EmployeeItem from "@/lib/components/dashboard/employee/EmployeeItem.svelte"
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
            <EmployeeItem employee={dailyReport.employee} class="p-0" />
          </Card.Action>
        </Card.Header>
        <Card.Content class="space-y-4">
          {@render dayTypeBadge(dailyReport.dayType)}
          {#if dailyReport.dayType == DayType.WORK}
            {@render routeBadge(null)}
          {/if}
          <div class="flex gap-2">
            {@render statsBadge(VisitType.DOCTOR, 0)}
            {@render statsBadge(VisitType.STOCKIST, 0)}
            {@render statsBadge(VisitType.CHEMIST, 0)}
          </div>

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
