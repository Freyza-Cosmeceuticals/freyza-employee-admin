<script lang="ts">
import { Button } from "$lib/components/ui/button/index.js"
import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js"

import CopyIcon from "@lucide/svelte/icons/copy"
import EllipsisIcon from "@lucide/svelte/icons/ellipsis"
import ViewIcon from "@lucide/svelte/icons/eye"
import EditIcon from "@lucide/svelte/icons/pencil"

let { id }: { id: string } = $props()
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
        <span class="sr-only">Open menu</span>
        <EllipsisIcon />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content class="min-w-max" align="end">
    <DropdownMenu.Group>
      <DropdownMenu.Label>Actions</DropdownMenu.Label>
      <DropdownMenu.Item onclick={() => navigator.clipboard.writeText(id)}>
        <CopyIcon class="size-4" />
        Copy Employee ID
      </DropdownMenu.Item>
    </DropdownMenu.Group>
    <DropdownMenu.Separator />
    <DropdownMenu.Item>
      <ViewIcon class="size-4" />
      View Employee
    </DropdownMenu.Item>
    <DropdownMenu.Item>
      <EditIcon class="size-4" />
      Edit Employee
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
