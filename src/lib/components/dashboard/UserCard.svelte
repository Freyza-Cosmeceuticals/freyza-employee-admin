<script lang="ts">
import * as Avatar from "@ui/avatar"
import { Badge } from "@ui/badge"
import * as Item from "@ui/item"

import type { ItemVariant } from "@ui/item/item.svelte"
import type { EmployeeWithHQ } from "$lib/types"
import type { ClassValue } from "svelte/elements"

interface Props {
  user: EmployeeWithHQ
  actionUrl?: string
  actionLabel?: string
  variant?: ItemVariant
  compact?: boolean
  class?: ClassValue
}

let {
  user,
  actionUrl,
  actionLabel = "View",
  variant,
  compact = false,
  class: itemClass
}: Props = $props()
</script>

<Item.Root {variant} class={["w-full", compact && "p-1", itemClass]}>
  <Item.Media variant="icon">
    <Avatar.Root class="size-10">
      <Avatar.Image src="https://github.com/harshnarayanjha.png" />
      <Avatar.Fallback>{user.name.substring(0, 1)}</Avatar.Fallback>
    </Avatar.Root>
  </Item.Media>
  <Item.Content class="gap-1 text-start">
    <Item.Title class="line-clamp-1">
      {user.name}
      <Badge variant="outline" class="text-xs">{user.tier}</Badge>
    </Item.Title>
    <Item.Description class="line-clamp-1">{user.hq?.name}</Item.Description>
  </Item.Content>
  {#if actionUrl}
    <Item.Actions>
      <a href={actionUrl} class="text-sm hover:underline">{actionLabel}</a>
    </Item.Actions>
  {/if}
</Item.Root>
