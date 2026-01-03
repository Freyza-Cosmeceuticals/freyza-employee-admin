<script lang="ts">
import * as Card from "@ui/card"

import AddEmployeeButton from "./AddEmployeeButton.svelte"
import type { User } from "@db/browser"

interface Props {
  userProfile: User | null
}

let { userProfile }: Props = $props()
</script>

{#if userProfile}
  <Card.Root class="w-full border-0 bg-transparent shadow-none">
    <Card.Header>
      <Card.Title class="text-2xl">
        Welcome, {userProfile.name}
      </Card.Title>
      <Card.Description>to your admin dashboard</Card.Description>
      <Card.Action>
        <AddEmployeeButton />
      </Card.Action>
    </Card.Header>
  </Card.Root>
{:else}
  <Card.Root>
    <Card.Content>No valid User Profile was found</Card.Content>
  </Card.Root>
{/if}
