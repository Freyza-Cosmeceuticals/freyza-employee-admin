<script lang="ts">
import AddEmployeeButton from "@/components/dashboard/AddEmployeeButton.svelte"
import TopEmployeeList from "@/components/dashboard/TopEmployeeList.svelte"
import * as Card from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { PageServerLoad } from "./$types.js"

let { data } = $props()
let { employees }: PageServerLoad = $derived(data)
</script>

<svelte:head>
  <title>Employees | Freyza Cosmeceuticals Employee System</title>
  <meta name="description" content="Employees page for Freyza Cosmeceuticals Employee System" />
</svelte:head>

<div class="h-auto w-full space-y-8 px-4 py-8">
  <Card.Root class="w-full border-0 bg-transparent shadow-none">
    <Card.Header>
      <Card.Title class="text-2xl">Employees</Card.Title>
      <Card.Description>all people working for you</Card.Description>
      <Card.Action>
        <AddEmployeeButton />
      </Card.Action>
    </Card.Header>
  </Card.Root>

  <div class="mx-auto max-w-5xl">
    {#await employees}
      <Skeleton class="h-12 w-full" />
    {:then data}
      <TopEmployeeList variant="outline" employees={data} />
    {:catch error}
      <p class="text-center text-lg font-medium text-gray-500">
        An error occurred while fetching employees.
      </p>
    {/await}
  </div>
</div>
