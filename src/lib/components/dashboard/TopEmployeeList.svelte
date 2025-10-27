<script lang="ts">
import * as Empty from "@/components/ui/empty"
import type { User } from "@prisma/client"
import AddEmployeeButton from "./AddEmployeeButton.svelte"
import * as Item from "@/components/ui/item"
import Eye from "@lucide/svelte/icons/eye"

interface Props {
  employees: User[]
}

let { employees }: Props = $props()
</script>

<!-- Wrapped in Card.Content -->
<Item.Group>
  {#each employees as emp, i (emp.id)}
    <Item.Root>
      <Item.Content class="gap-1">
        <Item.Title>{emp.name}</Item.Title>
        <Item.Description>{emp.location}</Item.Description>
        <Item.Actions>
          <a href="##"><Eye /></a>
        </Item.Actions>
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
