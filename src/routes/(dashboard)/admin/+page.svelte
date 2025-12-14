<script lang="ts">
import { Skeleton } from "@/components/ui/skeleton"
import * as Card from "@/components/ui/card"
import AdminProfileCard from "@/components/dashboard/AdminProfileCard.svelte"
import EmployeeList from "@/components/dashboard/EmployeeList.svelte"
import { Button } from "@/components/ui/button"
import { resolve } from "$app/paths"

let { data } = $props()
let { userProfile: userProfilePromise, employees } = $derived(data)

let userProfile = $derived(await userProfilePromise)
</script>

<svelte:head>
  <title>Admin Dashboard | Freyza Cosmeceuticals Employee System</title>
  <meta
    name="description"
    content="Admin Dashboard page for Freyza Cosmeceuticals Employee System"
  />
</svelte:head>

<div class="h-auto w-full space-y-8 px-4 py-8">
  <!-- Admin Profile Section -->
  <AdminProfileCard {userProfile} />

  <!-- Employees and Expenses List -->
  <div class="my-16 grid grid-cols-1 place-content-center gap-4 px-16 md:grid-cols-2">
    <Card.Root class="mx-auto w-full max-w-xl">
      <Card.Header>
        <Card.Title>My Employees</Card.Title>
        {#await employees}
          <Skeleton class="inline-block h-2.5 w-8" />
        {:then data}
          <Card.Description>
            Your top
            {data.length}
            Employees
          </Card.Description>
        {:catch error}
          0
        {/await}
        <Card.Action>
          <Button variant="link" href={resolve("/admin/employees")}>View All</Button>
        </Card.Action>
      </Card.Header>
      <Card.Content>
        {#await employees}
          <Skeleton class="h-12 w-full" />
        {:then data}
          <EmployeeList employees={data} />
        {:catch error}
          <p>
            Error loading employees: {error}
          </p>
        {/await}
      </Card.Content>
    </Card.Root>

    <Card.Root class="mx-auto w-full max-w-xl">
      <Card.Header>
        <Card.Title>Expenses</Card.Title>
        <Skeleton class="inline-block h-2.5 w-8" />
        <!-- <Card.Description>
          Your top
          Expenses
        </Card.Description> -->
        <Card.Action>
          <Button href={resolve("/admin")}>View All</Button>
        </Card.Action>
      </Card.Header>
      <Card.Content>
        <Skeleton class="h-12 w-full" />
      </Card.Content>
    </Card.Root>
  </div>
</div>
