<script lang="ts">
import { resolve } from "$app/paths"

import { Button, buttonVariants } from "@ui/button"
import * as DropdownMenu from "@ui/dropdown-menu"

import CopyIcon from "@lucide/svelte/icons/copy"
import EllipsisIcon from "@lucide/svelte/icons/ellipsis"
import ViewIcon from "@lucide/svelte/icons/eye"

let { reportId, id }: { reportId: string; id: string } = $props()
</script>

<a
  href={resolve(`/admin/dailyreport/${reportId}/visit/${id}`)}
  class={buttonVariants({ variant: "secondary", size: "sm" })}>
  <ViewIcon /> View
</a>
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
  </DropdownMenu.Content>
</DropdownMenu.Root>
