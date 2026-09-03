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
import { findVisitsCamera } from "@/lib/helpers.js"
import ArrowLeft from "@lucide/svelte/icons/arrow-left"
import DollarSignIcon from "@lucide/svelte/icons/circle-dollar-sign"
import PackageCheckIcon from "@lucide/svelte/icons/package-check"
import ReceiptIcon from "@lucide/svelte/icons/receipt"
import ShoppingBagIcon from "@lucide/svelte/icons/shopping-bag"
import WalletIcon from "@lucide/svelte/icons/wallet"
import { DateTime } from "luxon"
import { mode } from "mode-watcher"

import { columns } from "./columns"
import type { EmployeeWithHQ, RouteWithName } from "$lib/types"

let { data, params } = $props()
let { claims } = $derived(data)

let routes = $state<RouteWithName[] | null>(null)
routes = await fetchRoutes()

// TODO: Make these common utils, currently scattered
const formatCurrency = (amount: number) => {
  return Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount)
}

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
    {const report = $derived(await getDailyReportByIdWithVisits(params.reportId))}
    {const reportRoute = $derived(routes?.find((it) => it.id == report?.routeId) ?? null)}
    {const reportDate = $derived(report ? DateTime.fromJSDate(report.date) : null)}

    {#if report && reportDate}
      {const reportVisits = $derived(report.visits ?? [])}
      {const totalOrderSales = $derived(
        reportVisits.reduce((sum, v) => sum + (v.orderAmount ? parseFloat(v.orderAmount) : 0), 0)
      )}
      {const totalCollections = $derived(
        reportVisits.reduce(
          (sum, v) => sum + (v.amountWithoutGST ? parseFloat(v.amountWithoutGST) : 0),
          0
        )
      )}
      {const totalExpense = $derived(report.totalExpense ?? 0)}
      {const totalOutstanding = $derived(
        reportVisits.reduce(
          (sum, v) => sum + (v.outstandingAmount ? parseFloat(v.outstandingAmount) : 0),
          0
        )
      )}
      {const ordersCount = $derived(reportVisits.filter((v) => v.orderTaken).length)}
      {const totalSamples = $derived(
        reportVisits.reduce((sum, v) => sum + (v.samplesGiven?.length ?? 0), 0)
      )}

      {const orderConversionRate = $derived(
        reportVisits.length > 0 ? ((ordersCount / reportVisits.length) * 100).toFixed(0) : 0
      )}

      <PageHeader title="Daily Report" {subheader} />

      <div class="space-y-6">
        <!-- Main Card with Details and Map -->
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
                  ? `LOCKED (${report.lockedAt ? report.lockedAt.toLocaleString(DateTime.DATETIME_MED) : "-"})`
                  : "UNLOCKED"}
              </Badge>
            </Card.Description>
            <Card.Action class="w-full">
              <div class="flex flex-row items-center gap-4">
                <EmployeeItem employee={report.employee as EmployeeWithHQ} compact={true} />
                {#if report.travellingWith}
                  <Badge variant="secondary" class="h-auto text-center">Travelling<br />With</Badge>
                  <EmployeeItem employee={report.travellingWith as EmployeeWithHQ} compact={true} />
                {/if}
              </div>
            </Card.Action>
          </Card.Header>

          <!-- Report Financial & Performance Summary Banner -->
          <div class="my-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <!-- Order Sales -->
            <Card.Root>
              <Card.Header class="flex items-center gap-1.5 text-sm text-muted-foreground">
                <DollarSignIcon class="size-3.5" />
                <span>Total Order Sales</span>
              </Card.Header>
              <Card.Content class="text-xl font-bold">
                {formatCurrency(totalOrderSales)}
              </Card.Content>
              <Card.Footer class="text-sm text-muted-foreground">
                {ordersCount}
                {ordersCount === 1 ? "order" : "orders"} placed
              </Card.Footer>
            </Card.Root>

            <!-- Collections -->
            <Card.Root>
              <Card.Header class="flex items-center gap-1.5 text-sm text-muted-foreground">
                <ReceiptIcon class="size-3.5" />
                <span>Collections</span>
              </Card.Header>
              <Card.Content class="text-xl font-bold">
                {formatCurrency(totalCollections)}
              </Card.Content>
              <Card.Footer class="text-sm text-muted-foreground">W/O GST</Card.Footer>
            </Card.Root>

            <!-- Daily Expenses -->
            <Card.Root>
              <Card.Header class="flex items-center gap-1.5 text-sm text-muted-foreground">
                <WalletIcon class="size-3.5 " />
                <span>Total Daily Expense</span>
              </Card.Header>
              <Card.Content class="text-xl font-bold">
                {formatCurrency(totalExpense)}
              </Card.Content>
              <Card.Footer class="text-sm text-muted-foreground">
                TA: {formatCurrency(report.ta ?? 0)}
                &CenterDot; DA: {formatCurrency(report.da ?? 0)}
              </Card.Footer>
            </Card.Root>

            <!-- Orders Taken / Visits -->
            <Card.Root>
              <Card.Header class="flex items-center gap-1.5 text-sm text-muted-foreground">
                <ShoppingBagIcon class="size-3.5" />
                <span>Order Conversion</span>
              </Card.Header>
              <Card.Content class="text-xl font-bold">
                {orderConversionRate}%
              </Card.Content>
              <Card.Footer class="text-sm text-muted-foreground">
                {totalSamples} samples shown
              </Card.Footer>
            </Card.Root>

            <!-- Samples Given / Outstanding -->
            <Card.Root>
              <Card.Header class="flex items-center gap-1.5 text-sm text-muted-foreground">
                <PackageCheckIcon class="size-3.5" />
                <span>Outstanding</span>
              </Card.Header>
              <Card.Content class="text-lg font-bold">
                {formatCurrency(totalOutstanding)}
              </Card.Content>
            </Card.Root>
          </div>

          <Card.Content class="h-105 p-0">
            {const camera = findVisitsCamera(reportVisits)}
            <!-- Map.center expect longitude, latitude -->
            <Map
              center={camera.center}
              zoom={camera.zoom}
              theme={mode.current}
              styles={{
                light: "https://tiles.openfreemap.org/styles/liberty",
                dark: "https://tiles.openfreemap.org/styles/liberty"
              }}>
              <MapControls />

              {#each report.visits as vt (vt.id)}
                <MapMarker latitude={vt.latitude} longitude={vt.longitude}>
                  <MarkerContent>
                    <div
                      class="size-4 cursor-pointer rounded-full border-3 border-white bg-red-500 shadow-lg transition-transform hover:scale-110">
                    </div>
                    <MarkerLabel position="bottom" class="text-black">
                      {vt.poi?.name ?? "???"}
                    </MarkerLabel>
                  </MarkerContent>

                  <MarkerPopup class="w-62 p-4">
                    <div class="space-y-2">
                      <div class="text-base font-semibold">
                        {vt.poi?.name ?? "???"}
                      </div>

                      <div class="text-sm text-muted-foreground">
                        {vt.visitType}
                      </div>

                      <div class="space-y-1 border-t pt-2 text-sm">
                        <div>
                          <span class="font-medium">Location:</span>
                          {vt.latitude.toFixed(5)}, {vt.longitude.toFixed(5)}
                        </div>
                      </div>

                      {#if vt.orderTaken}
                        <div>
                          Order taken ({formatCurrency(
                            vt.orderAmount ? parseFloat(vt.orderAmount) : 0
                          )})
                        </div>
                      {/if}

                      {#if vt.samplesGiven?.length}
                        <div class="text-sm">
                          <span class="font-medium">Samples:</span>
                          {vt.samplesGiven.length}
                        </div>
                      {/if}
                    </div>
                  </MarkerPopup>
                </MapMarker>
              {/each}
            </Map>
          </Card.Content>
        </Card.Root>

        <DataTable {columns} data={reportVisits} />

        <div class="mt-8 flex gap-2">
          {@render statsBadge(
            VisitType.DOCTOR,
            reportVisits.filter((it) => it.visitType == VisitType.DOCTOR).length
          )}
          {@render statsBadge(
            VisitType.STOCKIST,
            reportVisits.filter((it) => it.visitType == VisitType.STOCKIST).length
          )}
          {@render statsBadge(
            VisitType.CHEMIST,
            reportVisits.filter((it) => it.visitType == VisitType.CHEMIST).length
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
