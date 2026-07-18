<script module lang="ts">
import { Badge } from "@ui/badge"

import { EmployeeTier, UserStatus } from "@/lib/types"

export { employeeStatus, employeeTier }
</script>

{#snippet employeeStatus({ status }: { status: UserStatus })}
  {#if status === UserStatus.ACTIVE}
    <Badge variant="default">Active</Badge>
  {:else if status === UserStatus.REVOKED}
    <Badge variant="destructive">Revoked</Badge>
  {:else}
    <Badge variant="secondary">Unknown</Badge>
  {/if}
{/snippet}

{#snippet employeeTier({ tier }: { tier: EmployeeTier | null })}
  {#if tier}
    <Badge variant="outline">{tier}</Badge>
  {:else}
    &mdash;
  {/if}
{/snippet}
