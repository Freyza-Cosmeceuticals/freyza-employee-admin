<script lang="ts">
import AddEmployeeButton from "$lib/components/dashboard/AddEmployeeButton.svelte"
import EmployeeList from "$lib/components/dashboard/EmployeeList.svelte"
import PageHeader from "$lib/components/dashboard/PageHeader.svelte"
import { Skeleton } from "@ui/skeleton"

let { data } = $props()
let { employees } = $derived(data)
</script>

<svelte:head>
  <title>Employees | Freyza Cosmeceuticals Employee System</title>
  <meta name="description" content="Employees page for Freyza Cosmeceuticals Employee System" />
</svelte:head>

<div class="h-auto w-full space-y-8 px-4 py-8">
  {#snippet addEmployeeAction()}
    <AddEmployeeButton />
  {/snippet}

  <PageHeader
    title="Employees"
    description="all people working for you"
    action={addEmployeeAction} />

  <div class="mx-auto max-w-5xl">
    {#await employees}
      <Skeleton class="h-12 w-full" />
    {:then data}
      <EmployeeList variant="outline" employees={data} />
    {:catch error}
      <p class="text-center text-lg font-medium text-gray-500">
        An error occurred while fetching employees.
      </p>
    {/await}
  </div>
</div>
