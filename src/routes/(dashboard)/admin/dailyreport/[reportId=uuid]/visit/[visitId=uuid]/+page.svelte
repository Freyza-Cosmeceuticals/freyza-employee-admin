<script lang="ts">
import { resolve } from "$app/paths"

import { Button } from "@ui/button/index.js"
import * as Card from "@ui/card"

import { getDailyReportById, getVisit } from "$lib/api/dailyreport.remote"
import { fetchRoutes } from "$lib/api/route.remote.js"

import PageHeader from "@/lib/components/dashboard/PageHeader.svelte"
import VisitCard from "@/lib/components/dashboard/VisitCard.svelte"
import Map from "@/lib/components/ui/map/Map.svelte"
import MapControls from "@/lib/components/ui/map/MapControls.svelte"
import MapMarker from "@/lib/components/ui/map/MapMarker.svelte"
import MarkerContent from "@/lib/components/ui/map/MarkerContent.svelte"
import MarkerTooltip from "@/lib/components/ui/map/MarkerTooltip.svelte"
import { Skeleton } from "@/lib/components/ui/skeleton/index.js"
import { getVisitName } from "@/lib/helpers.js"
import ArrowLeft from "@lucide/svelte/icons/arrow-left"
import { DateTime } from "luxon"
import { mode } from "mode-watcher"

import type { RouteWithName } from "$lib/types"

let { data, params } = $props()
let { claims } = $derived(data)

let routes = $state<RouteWithName[] | null>(null)
routes = await fetchRoutes()

$inspect(params).with(console.debug)
</script>

<svelte:head>
  <title>Visit | Freyza Cosmeceuticals Employee System</title>
  <meta name="description" content="Daily Report for Freyza Cosmeceuticals Employee System" />
</svelte:head>

{#snippet subheader()}
  <a
    href={resolve(`/admin/dailyreport/${params.reportId}`)}
    class="w-max text-muted-foreground transition-colors hover:text-foreground/80">
    <span class="flex items-center gap-1">
      <ArrowLeft class="inline size-4" />
      All Visits for this report
    </span>
  </a>
{/snippet}

<div class="h-auto w-full px-4 py-8">
  <svelte:boundary>
    {const visit = $derived(await getVisit(params.visitId))}
    {const visitTimestamp = $derived(visit ? visit.createdAt : null)}
    {const report = $derived(await getDailyReportById(params.reportId))}

    {#if visit && visitTimestamp}
      <PageHeader title="Visit to {getVisitName(visit)}" {subheader} />

      <Card.Root class="m-4 h-80 overflow-clip rounded-none border-0 p-0 shadow-none ring-0">
        <!-- Map.center expect longitude, latitude -->
        <Map
          center={[visit.longitude, visit.latitude]}
          zoom={14}
          theme={mode.current}
          styles={{
            light: "https://tiles.openfreemap.org/styles/liberty",
            dark: "https://tiles.openfreemap.org/styles/liberty"
          }}>
          <MapControls />

          <MapMarker latitude={visit.latitude} longitude={visit.longitude}>
            <MarkerContent>
              <div
                class="size-4 cursor-pointer rounded-full border-3 border-white bg-cyan-500 shadow-lg transition-transform hover:scale-110">
              </div>
            </MarkerContent>

            <MarkerTooltip>
              <p>Visit made here</p>
            </MarkerTooltip>
          </MapMarker>
        </Map>
      </Card.Root>

      <VisitCard {visit} />
    {:else}
      <PageHeader title="Visit Not Found" description="404 Not Found" />
    {/if}

    {#snippet pending()}
      <Skeleton class="h-36 w-full" />
    {/snippet}

    {#snippet failed(error, reset)}
      {@debug error}
      <div>
        <p>Failed to load visit details</p>
        <Button onclick={reset}>Retry</Button>
      </div>
    {/snippet}
  </svelte:boundary>
</div>
