<script lang="ts">
import { resolve } from "$app/paths"

import { Button } from "$lib/components/ui/button/index.js"
import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js"

import CopyIcon from "@lucide/svelte/icons/copy"
import EllipsisIcon from "@lucide/svelte/icons/ellipsis"
import ViewIcon from "@lucide/svelte/icons/eye"

let { reportId, id }: { reportId: string; id: string } = $props()
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
        Copy Visit ID
      </DropdownMenu.Item>
    </DropdownMenu.Group>
    <DropdownMenu.Separator />
    <DropdownMenu.Item class="cursor-pointer">
      {#snippet child({ props })}
        <a {...props} href={resolve(`/admin/dailyreport/${id}/visit/${id}`)}>
          <ViewIcon class="size-4" />
          View Visit
        </a>
      {/snippet}
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
