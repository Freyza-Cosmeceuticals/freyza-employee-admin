<script lang="ts">
import * as Empty from "@/components/ui/empty"
import * as Item from "@/components/ui/item"

import CalendarIcon from "@lucide/svelte/icons/calendars"

import type { ItemVariant } from "@/components/ui/item/item.svelte"

interface Props {
  variant?: ItemVariant
  tasks: { id: number; task: string; urgency: string }[]
}

let { variant = "default", tasks }: Props = $props()
</script>

<!-- Wrapped in Card.Content -->
<Item.Group>
  {#each tasks as task, i (task.id)}
    <Item.Root {variant}>
      <Item.Content>
        {task.task} - {task.urgency}
      </Item.Content>
    </Item.Root>
    {#if i !== tasks.length - 1}
      <Item.Separator />
    {/if}
  {:else}
    <Empty.Root>
      <Empty.Header>
        <Empty.Media variant="icon">
          <CalendarIcon />
        </Empty.Media>
        <Empty.Title>0 Tasks</Empty.Title>
        <Empty.Description>You have no tasks for now.</Empty.Description>
      </Empty.Header>
    </Empty.Root>
  {/each}
</Item.Group>
