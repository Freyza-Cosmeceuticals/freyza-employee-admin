<script lang="ts">
import { page } from "$app/state"

import * as Card from "@ui/card"
import { Separator } from "@ui/separator"

import { getDailyReportByIdWithVisits } from "$lib/api/dailyreport.remote"
import { fetchRoutes } from "$lib/api/route.remote.js"
import { DayType, VisitType } from "$lib/types"

import {
  dayTypeBadge,
  routeBadge,
  statsBadge
} from "@/lib/components/dashboard/dailyreport/snippets.svelte"
import EmployeeItem from "@/lib/components/dashboard/employee/EmployeeItem.svelte"
import Badge from "@/lib/components/ui/badge/badge.svelte"
import { DateTime } from "luxon"

import type { RouteWithName } from "$lib/types"

let { data } = $props()
let { user } = $derived(data)

let routes = $state<RouteWithName[] | null>(null)
routes = await fetchRoutes()

let reportRoute = $derived(routes?.find((it) => it.id == dailyReport?.routeId) ?? null)

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
            <br />
            {@render dayTypeBadge(dailyReport.dayType)}
            {#if dailyReport.dayType == DayType.WORK}
              {@render routeBadge(reportRoute, "w-min")}
            {/if}
            <br />
            <Badge>
              {dailyReport.locked ? "LOCKED" : "UNLOCKED"}
            </Badge>
            {#if dailyReport.locked == true}
              <small>{dailyReport.lockedAt}</small>
            {/if}
          </Card.Title>
          <Card.Action>
            <EmployeeItem employee={dailyReport.employee} class="p-0" />
          </Card.Action>
        </Card.Header>
        <Separator />
        <Card.Content class="space-y-4">
          <p>
            {dailyReport.visits.length} visits recorded.
          </p>

          {#each dailyReport.visits.toReversed() as visit (visit.id)}
            <div>
              {visit.id} <br />
              Visit Type: {visit.visitType} <br />

              {#if visit.visitType == VisitType.DOCTOR}
                Doctor Name: {visit.doctorName} <br />
                Products Shown: {visit.productsShown.join(", ")} <br />
                Samples Given: {visit.samplesGiven.join(", ")} <br />
                {visit.orderTaken ? "Order Taken" : "Order Not Taken"} <br />
              {:else if visit.visitType == VisitType.STOCKIST}
                Stockist Name: {visit.stockistName} <br />
                {visit.stockChecked ? "Stock Checked" : "Stock not Checked"} <br />
                Products Shown: {visit.productsShown.join(", ")} <br />
                Samples Given: {visit.samplesGiven.join(", ")} <br />
                {visit.orderTaken ? "Order Taken" : "Order Not Taken"} <br />
                {visit.paymentCollected ? "Payment Collected" : "Payment Not Collected"}
                {#if visit.paymentCollected}
                  With GST: {visit.amountWithGST} <br />
                  Without GST: {visit.amountWithoutGST}
                {/if}
              {:else if visit.visitType == VisitType.CHEMIST}
                Chemist Name: {visit.chemistName} <br />
                Products Shown: {visit.productsShown.join(", ")} <br />
                {visit.orderTaken ? "Order Taken" : "Order Not Taken"} <br />
              {/if}
            </div>
            <Separator />
          {:else}
            <p>No Visits recorded.</p>
          {/each}
        </Card.Content>
        <Separator />
        <Card.Footer>
          <div class="flex gap-2">
            {@render statsBadge(
              VisitType.DOCTOR,
              dailyReport.visits.filter((it) => it.visitType == VisitType.DOCTOR).length
            )}
            {@render statsBadge(
              VisitType.STOCKIST,
              dailyReport.visits.filter((it) => it.visitType == VisitType.STOCKIST).length
            )}
            {@render statsBadge(
              VisitType.CHEMIST,
              dailyReport.visits.filter((it) => it.visitType == VisitType.CHEMIST).length
            )}
          </div>
        </Card.Footer>
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
