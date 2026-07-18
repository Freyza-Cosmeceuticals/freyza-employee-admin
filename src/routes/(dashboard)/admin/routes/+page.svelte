<script lang="ts">
import AddRouteButton from "$lib/components/dashboard/AddRouteButton.svelte"
import PageHeader from "$lib/components/dashboard/PageHeader.svelte"
import * as Alert from "@ui/alert"
import { Skeleton } from "@ui/skeleton"

import { fetchRoutes } from "$lib/api/route.remote"

import DataTable from "@/lib/components/dashboard/table/data-table.svelte"
import { Button } from "@/lib/components/ui/button"
import CircleAlertIcon from "@lucide/svelte/icons/circle-alert"

import { columns } from "./columns"
</script>

<svelte:head>
  <title>Routes | Freyza Cosmeceuticals Employee System</title>
  <meta name="description" content="Routes page for Freyza Cosmeceuticals Employee System" />
</svelte:head>

<div class="h-auto space-y-8 px-4 py-8">
  {#snippet addRouteAction()}
    <AddRouteButton />
  {/snippet}

  <PageHeader title="Routes" description="Operational routes" action={addRouteAction} />

  <div class="px-8 mx-auto">
    <svelte:boundary>
      {const routes = await fetchRoutes()}
      <DataTable {columns} data={routes} />

      {#snippet pending()}
        <Skeleton class="h-12 w-full" />
      {/snippet}

      {#snippet failed(error, reset)}
        {console.error(error)}

        <Alert.Root variant="destructive">
          <CircleAlertIcon class="size-4" />
          <Alert.Title>Error</Alert.Title>
          <Alert.Description>
            Something went wrong while listing routes. Please try again.
          </Alert.Description>
          <Alert.Action>
            <Button variant="ghost" onclick={reset}>Retry</Button>
          </Alert.Action>
        </Alert.Root>
      {/snippet}
    </svelte:boundary>
  </div>
</div>
