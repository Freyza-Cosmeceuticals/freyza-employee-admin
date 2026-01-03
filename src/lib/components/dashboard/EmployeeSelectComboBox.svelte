<script lang="ts">
import * as Avatar from "$lib/components/ui/avatar"
import { Button } from "$lib/components/ui/button/index.js"
import * as Command from "$lib/components/ui/command/index.js"
import * as Popover from "$lib/components/ui/popover/index.js"

import { cn } from "$lib/utils.js"

import CheckIcon from "@lucide/svelte/icons/check"
import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down"
import { tick } from "svelte"

import type { EmployeeWithHQ } from "$lib/types"

interface Props {
  employees: EmployeeWithHQ[]
  value: string | undefined
  disabled: boolean
  error?: boolean
  onValueChange?: (value: string) => void
}

let { employees, value = $bindable(undefined), disabled, error, onValueChange }: Props = $props()

let open = $state(false)
let triggerRef = $state<HTMLButtonElement>(null!)

const selectedValue = $derived.by(() => {
  const emp = employees.find((e) => e.id === value)
  return emp?.name || "Select an employee..."
})

$effect(() => {
  if (error) {
    triggerRef.focus()
  }
})

// We want to refocus the trigger button when the user selects
// an item from the list so users can continue navigating the
// rest of the form with the keyboard.
function closeAndFocusTrigger() {
  open = false
  tick().then(() => {
    triggerRef.focus()
  })
}
</script>

<Popover.Root bind:open>
  <Popover.Trigger bind:ref={triggerRef} {disabled}>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="outline"
        class={[
          "justify-between",
          !value && "text-muted-foreground hover:text-muted-foreground",
          error && "text-destructive hover:text-destructive"
        ]}
        role="combobox"
        aria-invalid={error}
        aria-expanded={open}>
        {selectedValue || "Select an employee..."}
        <ChevronsUpDownIcon class="ms-2 size-4 shrink-0 opacity-50" />
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-75 p-0">
    <Command.Root>
      <Command.Input placeholder="Search employee..." />
      <Command.List>
        <Command.Empty>No employee found.</Command.Empty>
        <Command.Group>
          {#each employees as emp}
            <Command.Item
              value={emp.id}
              keywords={[...emp.name.split(" "), ...(emp.hq?.name.split(" ") || [])]}
              onSelect={() => {
                value = emp.id
                closeAndFocusTrigger()
                onValueChange?.(value)
              }}>
              <Avatar.Root>
                <Avatar.Image src="https://github.com/HarshNarayanJha.png" alt={emp.name} />
                <Avatar.Fallback>{emp.name.charAt(0).toUpperCase()}</Avatar.Fallback>
              </Avatar.Root>
              {emp.name} ({emp.hq?.name || "No HQ"})
              <CheckIcon class={cn("me-2 size-4", value !== emp.id && "text-transparent")} />
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
