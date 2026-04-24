<script lang="ts">
import UserCard from "../UserCard.svelte"
import type { ItemVariant } from "@ui/item/item.svelte"
import type { EmployeeWithHQ } from "$lib/types"
import type { ClassValue } from "svelte/elements"

interface Props {
  employee: EmployeeWithHQ
  variant?: ItemVariant
  compact?: boolean
  class?: ClassValue
}

let { employee, variant, compact = false, class: itemClass }: Props = $props()

let actionUrl = $derived(`/admin/employees/${employee.id}`)
</script>

<UserCard user={employee} {variant} {compact} class={[itemClass, "hover:bg-foreground/5"]} />
