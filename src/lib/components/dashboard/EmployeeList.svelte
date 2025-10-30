<script lang="ts">
import * as Empty from "@/components/ui/empty"
import { type User, UserStatus } from "@prisma/client"
import AddEmployeeButton from "./AddEmployeeButton.svelte"
import * as Item from "@/components/ui/item"
import * as Avatar from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { ItemVariant } from "../ui/item/item.svelte"
import type { EmployeeWithHQ } from "@/types"

interface Props {
  variant?: ItemVariant
  employees: EmployeeWithHQ[]
}

let { variant = "default", employees }: Props = $props()
</script>

{#snippet employeeStatus(status: UserStatus)}
  {#if status === UserStatus.ACTIVE}
    <Badge variant="secondary">Active</Badge>
  {:else if status === UserStatus.REVOKED}
    <Badge variant="destructive">Revoked</Badge>
  {/if}
{/snippet}

<!-- Wrapped in Card.Content -->
<Item.Group>
  {#each employees as emp, i (emp.id)}
    <Item.Root {variant}>
      <Item.Media variant="icon">
        <Avatar.Root class="size-10">
          <Avatar.Image src="https://github.com/harshnarayanjha.png" />
          <Avatar.Fallback>{emp.name.substring(0, 1)}</Avatar.Fallback>
        </Avatar.Root>
      </Item.Media>
      <Item.Content class="gap-1">
        <Item.Title class="line-clamp-1">{emp.name}</Item.Title>
        <Item.Description>{emp.hq?.name}</Item.Description>
      </Item.Content>
      <Item.Content class="flex-none text-center">
        <Item.Description>
          <Badge variant="default">{emp.tier}</Badge>
          <!-- {@render employeeStatus(emp.status)} -->
        </Item.Description>
      </Item.Content>
    </Item.Root>
    {#if i !== employees.length - 1}
      <Item.Separator />
    {/if}
  {:else}
    <Empty.Root>
      <Empty.Header>
        <!-- <Empty.Media variant="icon">
            <FolderCodeIcon />
          </Empty.Media> -->
        <Empty.Title>0 Employees</Empty.Title>
        <Empty.Description>You have no employees yet.</Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <AddEmployeeButton />
      </Empty.Content>
    </Empty.Root>
  {/each}
</Item.Group>
