<script lang="ts">
import { Badge } from "@ui/badge"
import * as Empty from "@ui/empty"
import * as Item from "@ui/item"

import { UserStatus } from "$lib/types"

import AddEmployeeButton from "./AddEmployeeButton.svelte"
import EmployeeItem from "./employee/EmployeeItem.svelte"
import type { ItemVariant } from "@ui/item/item.svelte"
import type { EmployeeWithHQ } from "$lib/types"

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
    <EmployeeItem employee={emp} {variant} />
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
