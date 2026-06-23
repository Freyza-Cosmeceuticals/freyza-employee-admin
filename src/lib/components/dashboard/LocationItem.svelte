<script lang="ts">
import { Button } from "@ui/button"
import * as Dialog from "@ui/dialog"
import * as Item from "@ui/item"

import { toast } from "svelte-sonner"

import type { LocationWithName } from "$lib/types"

interface Props {
  location: LocationWithName
}

let { location }: Props = $props()
</script>

<Item.Root variant="outline" class="w-full">
  <Item.Content class="flex-row items-center justify-between">
    <Item.Title class="text-base font-medium">{location.name}</Item.Title>
    <Item.Actions>
      <Dialog.Root>
        <Dialog.Trigger>
          <Button variant="ghost" size="sm">Edit</Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Edit Location</Dialog.Title>
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
