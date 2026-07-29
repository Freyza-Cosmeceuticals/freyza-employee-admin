<script lang="ts">
import AddEmployeeButton from "$lib/components/dashboard/AddEmployeeButton.svelte"
import PageHeader from "$lib/components/dashboard/PageHeader.svelte"
import * as Alert from "@ui/alert"
import { Skeleton } from "@ui/skeleton"

import { getAllEmployees } from "$lib/api/employee.remote"

import DataTable from "@/lib/components/dashboard/table/data-table.svelte"
import { Button } from "@/lib/components/ui/button"
import CircleAlertIcon from "@lucide/svelte/icons/circle-alert"

import { columns } from "./columns"
</script>

<svelte:head>
  <title>Employees | Freyza Cosmeceuticals Employee System</title>
  <meta name="description" content="Employees page for Freyza Cosmeceuticals Employee System" />
</svelte:head>

<div class="h-auto space-y-8 px-4 py-8">
  {#snippet addEmployeeAction()}
    <AddEmployeeButton />
  {/snippet}

  <PageHeader
    title="Employees"
    description="All the people working for you"
    action={addEmployeeAction} />

  <div class="mx-auto px-8">
    <svelte:boundary>
      {const employees = $derived(await getAllEmployees())}
      <!-- <EmployeeList variant="outline" {employees} /> -->
      <DataTable {columns} data={employees} />

      {#snippet pending()}
        <Skeleton class="h-12 w-full" />
      {/snippet}

      {#snippet failed(error, reset)}
        {console.error(error)}

        <Alert.Root variant="destructive">
          <CircleAlertIcon class="size-4" />
          <Alert.Title>Error</Alert.Title>
          <Alert.Description>
            Something went wrong while listing employees. Please try again.
          </Alert.Description>
          <Alert.Action>
            <Button variant="ghost" onclick={reset}>Retry</Button>
          </Alert.Action>
        </Alert.Root>
      {/snippet}
    </svelte:boundary>
  </div>
</div>
