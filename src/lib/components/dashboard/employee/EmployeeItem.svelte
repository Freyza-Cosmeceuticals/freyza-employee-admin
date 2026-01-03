<script lang="ts">
import * as Avatar from "@ui/avatar"
import { Badge } from "@ui/badge"
import * as Item from "@ui/item"

import type { ItemVariant } from "@ui/item/item.svelte"
import type { EmployeeWithHQ } from "$lib/types"

interface Props {
  employee: EmployeeWithHQ
  variant?: ItemVariant
}

let { employee, variant }: Props = $props()
</script>

<Item.Root {variant}>
  <Item.Media variant="icon">
    <Avatar.Root class="size-10">
      <Avatar.Image src="https://github.com/harshnarayanjha.png" />
      <Avatar.Fallback>{employee.name.substring(0, 1)}</Avatar.Fallback>
    </Avatar.Root>
  </Item.Media>
  <Item.Content class="gap-1 text-start">
    <Item.Title class="line-clamp-1">{employee.name}</Item.Title>
    <Item.Description class="line-clamp-1">{employee.hq?.name}</Item.Description>
  </Item.Content>
  <Item.Content class="flex-none text-center">
    <Item.Description>
      <Badge variant="default">{employee.tier}</Badge>
      <!-- {@render employeeStatus(employee.status)} -->
    </Item.Description>
  </Item.Content>
</Item.Root>
