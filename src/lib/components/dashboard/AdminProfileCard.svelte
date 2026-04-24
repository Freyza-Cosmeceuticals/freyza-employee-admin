<script lang="ts">
import * as Card from "@ui/card"

import AddEmployeeButton from "./AddEmployeeButton.svelte"
import type { User } from "$lib/types"

interface Props {
  userProfile: User | null
}

let { userProfile }: Props = $props()
</script>

<Card.Root class="w-full border-0 bg-transparent shadow-none ring-0">
  {#if userProfile}
    <Card.Header>
      <Card.Title class="text-2xl">
        Welcome, {userProfile.name}
      </Card.Title>
      <Card.Description>to your admin dashboard</Card.Description>
      <Card.Action>
        <AddEmployeeButton />
      </Card.Action>
    </Card.Header>
  {:else}
    <Card.Content>No valid User Profile was found</Card.Content>
  {/if}
</Card.Root>
