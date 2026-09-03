<script lang="ts">
import PageHeader from "$lib/components/dashboard/PageHeader.svelte"
import * as Alert from "@ui/alert"
import { Skeleton } from "@ui/skeleton"

import { fetchPoisWithDetails } from "$lib/api/poi.remote"

import DataTable from "@/lib/components/dashboard/table/data-table.svelte"
import { Button } from "@/lib/components/ui/button"
import CircleAlertIcon from "@lucide/svelte/icons/circle-alert"

import { columns } from "./columns"
</script>

<svelte:head>
  <title>Point of Interests | Freyza Cosmeceuticals Employee System</title>
  <meta name="description" content="POI page for Freyza Cosmeceuticals Employee System" />
</svelte:head>

<div class="h-auto space-y-8 px-4 py-8">
  <PageHeader title="Point of Interests" description="Doctors, Chemists and Stockists" />

  <div class="mx-auto px-8">
    <svelte:boundary>
      {const pois = $derived(await fetchPoisWithDetails())}
      <DataTable {columns} data={pois} />

      {#snippet pending()}
        <Skeleton class="h-12 w-full" />
      {/snippet}

      {#snippet failed(error, reset)}
        {console.error(error)}

        <Alert.Root variant="destructive">
          <CircleAlertIcon class="size-4" />
          <Alert.Title>Error</Alert.Title>
          <Alert.Description>
            Something went wrong while listing POIs. Please try again.
          </Alert.Description>
          <Alert.Action>
            <Button variant="ghost" onclick={reset}>Retry</Button>
          </Alert.Action>
        </Alert.Root>
      {/snippet}
    </svelte:boundary>
  </div>
</div>
