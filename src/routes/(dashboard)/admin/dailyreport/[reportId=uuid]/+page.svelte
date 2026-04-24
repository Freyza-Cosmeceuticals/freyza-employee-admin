<script lang="ts">
import { resolve } from "$app/paths"
import { page } from "$app/state"

import { buttonVariants } from "@ui/button"
import * as Card from "@ui/card"
import * as Collapsible from "@ui/collapsible"
import { Separator } from "@ui/separator"

import { getDailyReportByIdWithVisits } from "$lib/api/dailyreport.remote"
import { fetchRoutes } from "$lib/api/route.remote.js"
import { DayType, VisitType } from "$lib/types"

import EmployeeItem from "@/lib/components/dashboard/employee/EmployeeItem.svelte"
import PageHeader from "@/lib/components/dashboard/PageHeader.svelte"
import { dayTypeBadge, routeBadge, statsBadge } from "@/lib/components/dashboard/snippets.svelte"
import VisitCard from "@/lib/components/dashboard/VisitCard.svelte"
import Badge from "@/lib/components/ui/badge/badge.svelte"
import { getVisitName, getVisitTypeLabel } from "@/lib/helpers.js"
import ArrowLeft from "@lucide/svelte/icons/arrow-left"
import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down"
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

    {#snippet subheader()}
      <a
        href={resolve("/admin/dailyreport")}
        class="text-muted-foreground transition-colors hover:text-foreground/80">
        <span class="flex items-center gap-1">
          <ArrowLeft class="inline size-4" />
          All Reports
        </span>
      </a>
    {/snippet}

    <PageHeader title="Daily Report" {subheader} />
    <div class="mx-auto max-w-5xl">
      <Card.Root class="w-full">
        <Card.Header>
          <Card.Title class="text-xl font-bold">
            {date.toLocaleString(DateTime.DATE_MED)}
          </Card.Title>
          <Card.Description>
            {@render dayTypeBadge(dailyReport.dayType)}
            {#if dailyReport.dayType == DayType.WORK}
              {@render routeBadge(reportRoute, "w-min")}
            {/if}
            <Badge>
              {dailyReport.locked ? "LOCKED" : "UNLOCKED"}
            </Badge>
            {#if dailyReport.locked == true}
              <small>{dailyReport.lockedAt}</small>
            {/if}
          </Card.Description>
          <Card.Action>
            <EmployeeItem employee={dailyReport.employee} class="p-1" />
          </Card.Action>
        </Card.Header>
        <Separator />

        <Card.Content class="space-y-4">
          <p>
            <b>{dailyReport.visits.length} visits recorded.</b>
          </p>

          {#each dailyReport.visits.toReversed() as visit (visit.id)}
            <Collapsible.Root class="space-y-2">
              <Collapsible.Trigger
                class={buttonVariants({ variant: "ghost", size: "lg", class: "" })}>
                <div class="flex items-center justify-between space-x-4 px-4">
                  <span class="text-lg">{getVisitName(visit)}</span>
                  <Badge variant="secondary">{getVisitTypeLabel(visit.visitType)}</Badge>

                  <ChevronsUpDownIcon />
                  <span class="sr-only">Toggle</span>
                </div>
              </Collapsible.Trigger>
              <Collapsible.Content class="space-y-2">
                <VisitCard {visit} />
              </Collapsible.Content>
            </Collapsible.Root>
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
    <PageHeader title="Daily Report Not Found" description="404 Not Found" />
  {/if}
</div>
