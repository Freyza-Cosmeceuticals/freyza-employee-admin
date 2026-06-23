<script lang="ts">
import LocationItem from "$lib/components/dashboard/LocationItem.svelte"
import PageHeader from "$lib/components/dashboard/PageHeader.svelte"
import { Button } from "@ui/button"
import * as Dialog from "@ui/dialog"
import * as Item from "@ui/item"
import { Skeleton } from "@ui/skeleton"

import { fetchLocations } from "$lib/api/location.remote"

import { toast } from "svelte-sonner"
</script>

<svelte:head>
  <title>Locations | Freyza Cosmeceuticals Employee System</title>
</svelte:head>

<div class="h-auto w-full space-y-8 px-4 py-8">
  <PageHeader title="Locations" description="Operational locations" />

  <div class="flex justify-end mb-4">
    <Dialog.Root>
      <Dialog.Trigger>
        <Button>Create Location</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Create Location</Dialog.Title>
        </Dialog.Header>
        <p class="py-4">Not implemented yet.</p>
        <Dialog.Footer>
          <Dialog.Close>
            <Button variant="outline" onclick={() => toast.info("Not implemented yet.")}
              >Close</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  </div>

  <div class="mx-auto max-w-5xl">
    <svelte:boundary>
      {@const locations = await fetchLocations()}
      <Item.Group>
        {#each locations as loc (loc.id)}
          <LocationItem location={loc} />
        {:else}
          <p class="text-muted-foreground text-center py-8">No locations found.</p>
        {/each}
      </Item.Group>

      {#snippet pending()}
        <div class="grid gap-4">
          {#each [1, 2, 3] as i}
            <Skeleton class="h-16 w-full" />
          {/each}
        </div>
      {/snippet}
    </svelte:boundary>
  </div>
</div>
