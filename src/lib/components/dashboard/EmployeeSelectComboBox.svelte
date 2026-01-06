<script lang="ts">
import * as Avatar from "$lib/components/ui/avatar"
import { Button } from "$lib/components/ui/button/index.js"
import * as Command from "$lib/components/ui/command/index.js"
import * as Popover from "$lib/components/ui/popover/index.js"
import { Badge } from "@ui/badge"

import { cn } from "$lib/utils.js"

import CheckIcon from "@lucide/svelte/icons/check"
import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down"
import { tick } from "svelte"

import EmployeeItem from "./employee/EmployeeItem.svelte"
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
  return emp
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
          "w-52 justify-between",
          !value && "text-muted-foreground hover:text-muted-foreground",
          error && "text-destructive hover:text-destructive"
        ]}
        role="combobox"
        aria-invalid={error}
        aria-expanded={open}>
        {#if selectedValue}
          <Avatar.Root class="size-5">
            <Avatar.Image src="https://github.com/harshnarayanjha.png" />
            <Avatar.Fallback>{selectedValue.name.substring(0, 1)}</Avatar.Fallback>
          </Avatar.Root>
          <span class="me-auto line-clamp-1 truncate">
            {selectedValue.name}
          </span>
        {:else}
          <span class="me-auto line-clamp-1 truncate"> Select an employee... </span>
        {/if}

        <ChevronsUpDownIcon class="ms-2 size-4 shrink-0 opacity-50" />
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-96 p-0">
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
              <div class="flex w-full flex-row items-center justify-between gap-8">
                <EmployeeItem employee={emp} compact />
                <CheckIcon class={cn("me-4 size-4", value !== emp.id && "text-transparent")} />
              </div>
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
