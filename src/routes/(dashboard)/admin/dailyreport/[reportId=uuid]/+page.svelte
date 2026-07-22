<script lang="ts">
import { resolve } from "$app/paths"

import Badge from "@ui/badge/badge.svelte"
import { Button } from "@ui/button/index.js"
import * as Card from "@ui/card"

import { getDailyReportByIdWithVisits } from "$lib/api/dailyreport.remote"
import { fetchRoutes } from "$lib/api/route.remote.js"
import { DayType, VisitType } from "$lib/types"

import EmployeeItem from "@/lib/components/dashboard/employee/EmployeeItem.svelte"
import PageHeader from "@/lib/components/dashboard/PageHeader.svelte"
import { dayTypeBadge, routeBadge, statsBadge } from "@/lib/components/dashboard/snippets.svelte"
import DataTable from "@/lib/components/dashboard/table/data-table.svelte"
import Map from "@/lib/components/ui/map/Map.svelte"
import MapControls from "@/lib/components/ui/map/MapControls.svelte"
import MapMarker from "@/lib/components/ui/map/MapMarker.svelte"
import MarkerContent from "@/lib/components/ui/map/MarkerContent.svelte"
import MarkerLabel from "@/lib/components/ui/map/MarkerLabel.svelte"
import MarkerPopup from "@/lib/components/ui/map/MarkerPopup.svelte"
import { Skeleton } from "@/lib/components/ui/skeleton/index.js"
import { findVisitsCenter, getVisitName } from "@/lib/helpers.js"
import ArrowLeft from "@lucide/svelte/icons/arrow-left"
import { DateTime } from "luxon"

import { columns } from "./columns"
import type { RouteWithName } from "$lib/types"

let { data, params } = $props()
let { user } = $derived(data)

let routes = $state<RouteWithName[] | null>(null)
routes = await fetchRoutes()

$inspect(params).with(console.debug)
</script>

<svelte:head>
  <title>Daily Report | Freyza Cosmeceuticals Employee System</title>
  <meta name="description" content="Daily Report for Freyza Cosmeceuticals Employee System" />
</svelte:head>

{#snippet subheader()}
  <a
    href={resolve("/admin/dailyreport")}
    class="w-max text-muted-foreground transition-colors hover:text-foreground/80">
    <span class="flex items-center gap-1">
      <ArrowLeft class="inline size-4" />
      All Reports
    </span>
  </a>
{/snippet}

<div class="h-auto w-full px-4 py-2">
  <svelte:boundary>
    {const report = await getDailyReportByIdWithVisits(params.reportId)}
    {const reportRoute = $derived(routes?.find((it) => it.id == report?.routeId) ?? null)}
    {const reportDate = $derived(report ? DateTime.fromJSDate(report.date) : null)}

    {#if report && reportDate}
      <PageHeader title="Daily Report" {subheader} />

      <div class="space-y-4">
        <Card.Root class="w-full border-0 bg-transparent shadow-none ring-0">
          <Card.Header>
            <Card.Title class="text-xl font-bold">
              {reportDate.toLocaleString(DateTime.DATE_MED)}
            </Card.Title>
            <Card.Description>
              {@render dayTypeBadge(report.dayType)}
              {#if report.dayType == DayType.WORK}
                {@render routeBadge(reportRoute, "w-min")}
              {/if}
              <Badge variant="secondary">
                {report.locked
                  ? `LOCKED (${report.lockedAt ? DateTime.fromSQL(report.lockedAt).toLocaleString(DateTime.DATETIME_MED) : "-"})`
                  : "UNLOCKED"}
              </Badge>
            </Card.Description>
            <Card.Action>
              <EmployeeItem employee={report.employee} class="p-1" />
            </Card.Action>
          </Card.Header>

          <Card.Content class="h-105 p-0">
            {const center = findVisitsCenter(report.visits)}
            <!-- Map.center expect longitude, latitude -->
            <Map
              center={[center.longitude, center.latitude]}
              zoom={14}
              theme="light"
              styles={{
                light: "https://tiles.openfreemap.org/styles/bright",
                dark: "https://tiles.openfreemap.org/styles/bright"
              }}>
              <MapControls />

              {#each report.visits as pt (pt.id)}
                <MapMarker latitude={pt.latitude} longitude={pt.longitude}>
                  <MarkerContent>
                    <div
                      class="size-4 cursor-pointer rounded-full border-3 border-white bg-cyan-500 shadow-lg transition-transform hover:scale-110">
                    </div>
                    <MarkerLabel position="bottom">
                      {getVisitName(pt)}
                    </MarkerLabel>
                  </MarkerContent>

                  <MarkerPopup class="w-62 p-4">Visit details here</MarkerPopup>
                </MapMarker>
              {/each}
            </Map>
          </Card.Content>
        </Card.Root>

        <DataTable {columns} data={[...report.visits].reverse()} />

        <div class="mt-8 flex gap-2">
          {@render statsBadge(
            VisitType.DOCTOR,
            report.visits.filter((it) => it.visitType == VisitType.DOCTOR).length
          )}
          {@render statsBadge(
            VisitType.STOCKIST,
            report.visits.filter((it) => it.visitType == VisitType.STOCKIST).length
          )}
          {@render statsBadge(
            VisitType.CHEMIST,
            report.visits.filter((it) => it.visitType == VisitType.CHEMIST).length
          )}
        </div>
      </div>
    {:else}
      <PageHeader title="Daily Report Not Found" description="404 Not Found" />
    {/if}

    {#snippet pending()}
      <Skeleton class="h-36 w-full" />
    {/snippet}

    {#snippet failed(error, reset)}
      {@debug error}
      <div>
        <p>Failed to load report details</p>
        <Button onclick={reset}>Retry</Button>
      </div>
    {/snippet}
  </svelte:boundary>
</div>
