<script lang="ts">
import { Button } from "$lib/components/ui/button/index.js"
import * as Command from "$lib/components/ui/command/index.js"
import * as Popover from "$lib/components/ui/popover/index.js"

import CheckIcon from "@lucide/svelte/icons/check"
import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down"
import { tick } from "svelte"

import type { LocationWithName } from "$lib/types"
import type { ClassValue } from "svelte/elements"

interface Props {
  locations: LocationWithName[]
  value?: string | undefined
  placeholder?: string
  disabled?: boolean
  error?: boolean
  className?: ClassValue
  onValueChange?: (value: string) => void
}

let {
  locations,
  value = $bindable(undefined),
  placeholder = "Select location...",
  disabled = false,
  error = false,
  className,
  onValueChange
}: Props = $props()

let open = $state(false)
let triggerRef = $state<HTMLButtonElement>(null!)

const selectedLocation = $derived(locations.find((l) => l.id === value))

// We want to refocus the trigger button when the user selects
// an item from the list so users can continue navigating the
// rest of the form with the keyboard.
function closeAndFocusTrigger() {
  open = false
  tick().then(() => {
    triggerRef?.focus()
  })
}
</script>

<Popover.Root bind:open>
  <Popover.Trigger bind:ref={triggerRef} {disabled}>
    {#snippet child({ props })}
      <Button
        variant="outline"
        class={[
          "w-full justify-between font-normal",
          !value && "text-muted-foreground",
          error && "border-destructive text-destructive",
          className
        ]}
        {...props}
        role="combobox"
        aria-expanded={open}>
        <span class="truncate">{selectedLocation?.name || placeholder}</span>
        <ChevronsUpDownIcon class="ms-2 size-4 shrink-0 opacity-50" />
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-72 p-0" align="start">
    <Command.Root>
      <Command.Input placeholder="Search location..." />
      <Command.List>
        <Command.Empty>No location found.</Command.Empty>
        <Command.Group>
          {#each locations as loc (loc.id)}
            <Command.Item
              value={loc.id}
              keywords={[loc.name]}
              onSelect={() => {
                value = loc.id
                closeAndFocusTrigger()
                onValueChange?.(loc.id)
              }}>
              <CheckIcon class={["me-2 size-4", value !== loc.id && "text-transparent"]} />
              <span class="truncate">{loc.name}</span>
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
