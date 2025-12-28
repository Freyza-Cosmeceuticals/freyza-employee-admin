<script lang="ts">
import { Button } from "$lib/components/ui/button/index.js"
import * as Command from "$lib/components/ui/command/index.js"
import * as Popover from "$lib/components/ui/popover/index.js"
import { cn } from "$lib/utils.js"
import type { EmployeeWithHQ } from "@/types"
import CheckIcon from "@lucide/svelte/icons/check"
import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down"
import { tick } from "svelte"

interface Props {
  employees: EmployeeWithHQ[]
  value: string
  disabled: boolean
}

let { employees, value = $bindable(""), disabled }: Props = $props()

let open = $state(false)
let triggerRef = $state<HTMLButtonElement>(null!)

const selectedValue = $derived(employees.find((e) => e.id === value)?.name)

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
        variant="outline"
        class="w-[200px] justify-between"
        {...props}
        role="combobox"
        aria-expanded={open}>
        {selectedValue || "Select an employee..."}
        <ChevronsUpDownIcon class="ms-2 size-4 shrink-0 opacity-50" />
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-[200px] p-0">
    <Command.Root>
      <Command.Input placeholder="Search employee..." />
      <Command.List>
        <Command.Empty>No employee found.</Command.Empty>
        <Command.Group>
          {#each employees as emp}
            <Command.Item
              value={emp.id}
              keywords={emp.name.split(" ")}
              onSelect={() => {
                value = emp.id
                closeAndFocusTrigger()
              }}>
              <CheckIcon class={cn("me-2 size-4", value !== emp.id && "text-transparent")} />
              {emp.name}
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
