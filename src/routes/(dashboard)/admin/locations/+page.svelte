<script lang="ts">
import AddLocationButton from "$lib/components/dashboard/AddLocationButton.svelte"
import PageHeader from "$lib/components/dashboard/PageHeader.svelte"
import * as Alert from "@ui/alert"
import { Skeleton } from "@ui/skeleton"

import { fetchLocations } from "$lib/api/location.remote"

import DataTable from "@/lib/components/dashboard/table/data-table.svelte"
import { Button } from "@/lib/components/ui/button"
import CircleAlertIcon from "@lucide/svelte/icons/circle-alert"

import { columns } from "./columns"
</script>

<svelte:head>
  <title>Locations | Freyza Cosmeceuticals Employee System</title>
  <meta name="description" content="Locations page for Freyza Cosmeceuticals Employee System" />
</svelte:head>

<div class="h-auto space-y-8 px-4 py-8">
  {#snippet addLocationAction()}
    <AddLocationButton />
  {/snippet}

  <PageHeader title="Locations" description="Operational locations" action={addLocationAction} />

  <div class="px-8 mx-auto">
    <svelte:boundary>
      {const locations = await fetchLocations()}
      <DataTable {columns} data={locations} />

      {#snippet pending()}
        <Skeleton class="h-12 w-full" />
      {/snippet}

      {#snippet failed(error, reset)}
        {console.error(error)}

        <Alert.Root variant="destructive">
          <CircleAlertIcon class="size-4" />
          <Alert.Title>Error</Alert.Title>
          <Alert.Description>
            Something went wrong while listing locations. Please try again.
          </Alert.Description>
          <Alert.Action>
            <Button variant="ghost" onclick={reset}>Retry</Button>
          </Alert.Action>
        </Alert.Root>
      {/snippet}
    </svelte:boundary>
  </div>
</div>
