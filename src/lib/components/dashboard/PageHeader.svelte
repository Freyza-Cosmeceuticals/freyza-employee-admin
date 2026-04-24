<script lang="ts">
import * as Card from "@ui/card"

import type { Snippet } from "svelte"

interface Props {
  title: string
  description?: string
  action?: Snippet
  subheader?: Snippet
}

let { title, description, action, subheader }: Props = $props()
</script>

<Card.Root class="w-full border-0 bg-transparent shadow-none ring-0">
  <Card.Header>
    {#if subheader}
      {@render subheader()}
    {/if}
    <Card.Title class="text-2xl">{title}</Card.Title>
    {#if description}
      <Card.Description>{description}</Card.Description>
    {/if}
    {#if action}
      <Card.Action>
        {@render action()}
      </Card.Action>
    {/if}
  </Card.Header>
</Card.Root>
