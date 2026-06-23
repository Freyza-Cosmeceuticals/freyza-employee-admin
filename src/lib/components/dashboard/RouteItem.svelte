<script lang="ts">
import { Button } from "@ui/button"
import * as Dialog from "@ui/dialog"
import * as Item from "@ui/item"

import { toast } from "svelte-sonner"

import type { RouteWithName } from "$lib/types"

interface Props {
  route: RouteWithName
}

let { route }: Props = $props()
</script>

<Item.Root variant="outline" class="w-full">
  <Item.Content class="flex-row items-center justify-between">
    <div class="flex flex-col">
      <Item.Title class="text-base font-medium"
        >{route.srcLoc.name} → {route.destLoc.name}</Item.Title>
      <Item.Description class="text-sm text-muted-foreground"
        >{route.distanceKm} km</Item.Description>
    </div>
    <Item.Actions>
      <Dialog.Root>
        <Dialog.Trigger>
          <Button variant="ghost" size="sm">Edit</Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Edit Route</Dialog.Title>
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
    </Item.Actions>
  </Item.Content>
</Item.Root>
