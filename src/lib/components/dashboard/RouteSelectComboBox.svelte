<script lang="ts">
import { Button } from "$lib/components/ui/button/index.js"
import * as Command from "$lib/components/ui/command/index.js"
import * as Popover from "$lib/components/ui/popover/index.js"

import { cn } from "$lib/utils.js"

import CheckIcon from "@lucide/svelte/icons/check"
import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down"
import { tick } from "svelte"

import type { RouteWithName } from "$lib/types"

interface Props {
  routes: RouteWithName[]
  value: string | undefined
  disabled: boolean
  onValueChange?: (value: string) => void
}

let { routes, value = $bindable(undefined), disabled, onValueChange }: Props = $props()

let open = $state(false)
let triggerRef = $state<HTMLButtonElement>(null!)

const selectedValue = $derived.by(() => {
  const route = routes.find((r) => r.id === value)
  if (!route) return "Select a route..."

  return `${route.srcLoc.name} → ${route.destLoc.name} (${route.distanceKm}km)`
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
        variant="outline"
        class="w-50 justify-between"
        {...props}
        role="combobox"
        aria-expanded={open}>
        {selectedValue || "Select a route..."}
        <ChevronsUpDownIcon class="ms-2 size-4 shrink-0 opacity-50" />
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-75 p-0">
    <Command.Root>
      <Command.Input placeholder="Search route..." />
      <Command.List>
        <Command.Empty>No route found.</Command.Empty>
        <Command.Group>
          {#each routes as r}
            <Command.Item
              value={r.id}
              keywords={[r.srcLoc.name, r.destLoc.name]}
              onSelect={() => {
                value = r.id
                closeAndFocusTrigger()
                onValueChange?.(value)
              }}>
              <CheckIcon class={cn("my-2 me-2 size-4", value !== r.id && "text-transparent")} />
              <span>
                {r.srcLoc.name} &RightArrow; {r.destLoc.name} ({r.distanceKm}km)
              </span>
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
