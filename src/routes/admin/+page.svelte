<script lang="ts">
import AddEmployeeButton from "@/components/dashboard/AddEmployeeButton.svelte"

let { data } = $props()
let { supabase, user, userProfile } = $derived(data)
</script>

<div class="h-auto w-full px-4 py-8">
  {#if userProfile}
    <div class="flex flex-row justify-between">
      <h2 class="text-2xl font-semibold">Welcome, {userProfile.name}</h2>
      <p>Role: {userProfile.role}</p>

      <AddEmployeeButton />
    </div>
  {:else}
    <h2 class="text-2xl font-semibold">Welcome, {user?.email}</h2>
    <p>You don't have a profile</p>
  {/if}

  <div class="grid"></div>
</div>
