<script lang="ts">
import { replaceState } from "$app/navigation"
import { page } from "$app/state"

import ViewPlanCalendar from "$lib/components/dashboard/travelplan/ViewPlanCalendar.svelte"
import * as Card from "@ui/card"
import * as ScrollArea from "@ui/scroll-area"
import { Separator } from "@ui/separator"
import { Spinner } from "@ui/spinner"

import { getTravelPlansWithEntriesForMonth } from "$lib/api/travelplan.remote"
import { DayType } from "@db/browser"

import EmployeeItem from "@/lib/components/dashboard/employee/EmployeeItem.svelte"

let { data } = $props()
let { user, tpMonth, employees } = $derived(data)

const dayTypes = [DayType.WORK, DayType.LEAVE, DayType.HOLIDAY]

let selectedEmployeeId = $derived<string | null>(
  page.state.employeeId || page.url.searchParams.get("employeeId")
)
let travelPlans = $derived((await getTravelPlansWithEntriesForMonth(tpMonth.toISODate())) ?? [])

// undefined if not found
// null if selectedEmployeeId is null
let travelPlan = $derived(
  travelPlans?.find((tp) => tp.employeeId === selectedEmployeeId) ||
    (selectedEmployeeId ? undefined : null)
)

function changeEmployee(newId: string) {
  const newUrl = new URL(page.url)
  newUrl.searchParams.set("employeeId", newId)
  replaceState(newUrl, { employeeId: newId })
}

// $inspect("Month", tpMonth).with(console.log)
// $inspect("employeeId", selectedEmployeeId).with(console.log)
// $inspect("plns", travelPlans).with(console.log)
// $inspect("pln", travelPlan).with(console.log)
</script>

<svelte:head>
  <title>Travel Plan | Freyza Cosmeceuticals Employee System</title>
  <meta name="description" content="Travel Plan for Freyza Cosmeceuticals Employee System" />
</svelte:head>

<div class="flex h-[calc(100vh-4rem)] w-full overflow-hidden">
  <!-- employees sidebar -->
  <aside class="flex w-96 flex-col rounded-md border-t border-r bg-muted/20">
    <div class="flex flex-col gap-1 p-6 pb-4">
      <h3 class="text-xl font-bold tracking-tight">Employees</h3>
      <p class="text-xs font-medium tracking-wider text-muted-foreground uppercase">
        Select a team member
      </p>
    </div>

    <Separator />

    <ScrollArea.Root class="scrollbar-hide flex-1 overflow-y-scroll">
      <div class="p-4">
        <svelte:boundary>
          {@const empList = await employees}
          <div class="space-y-2">
            {#each empList as emp (emp.id)}
              <button
                class="h-auto w-full rounded-md p-0 hover:bg-muted/25"
                onclick={() => changeEmployee(emp.id)}>
                <EmployeeItem
                  employee={emp}
                  variant={selectedEmployeeId === emp.id ? "muted" : "default"} />
              </button>
            {:else}
              <div class="flex flex-col items-center justify-center py-12 text-center">
                <p class="text-sm text-muted-foreground">No employees found.</p>
              </div>
            {/each}
          </div>

          {#snippet pending()}
            <div class="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <Spinner class="size-6 text-primary" />
              <p class="text-sm font-medium text-muted-foreground">Loading roster...</p>
            </div>
          {/snippet}
        </svelte:boundary>
      </div>
    </ScrollArea.Root>
  </aside>

  <!-- main content -->
  <main class="flex-1 overflow-y-auto bg-muted/5 p-8">
    <div class="mx-auto max-w-5xl">
      {#if travelPlan}
        <Card.Root>
          <Card.Header class="flex flex-row items-center justify-between space-y-0">
            <div class="flex flex-col gap-1">
              <Card.Title class="text-2xl font-black">
                {tpMonth.monthLong}
                {tpMonth.year}
              </Card.Title>
              <Card.Description>Monthly travel</Card.Description>
            </div>

            <Card.Action>
              <EmployeeItem employee={travelPlan.employee} variant="outline" />
            </Card.Action>
          </Card.Header>

          <Separator />

          <Card.Content>
            <ViewPlanCalendar month={tpMonth} {dayTypes} planEntries={travelPlan.planEntries} />
          </Card.Content>
        </Card.Root>
      {:else if travelPlan === null}
        <div class="flex h-[60vh] flex-col items-center justify-center space-y-4 text-center">
          <div class="max-w-[320px] space-y-2">
            <h2 class="text-2xl font-bold tracking-tight">Select an Employee</h2>
            <p class="text-muted-foreground">
              Choose an employee from the sidebar to review their scheduled travel plans for {tpMonth.monthLong}.
            </p>
          </div>
        </div>
      {:else}
        <div class="flex h-[60vh] flex-col items-center justify-center space-y-4 text-center">
          <div class="max-w-[320px] space-y-2">
            <h2 class="text-2xl font-bold tracking-tight">Plan Not Found</h2>
            <p class="text-muted-foreground">
              We couldn't find a travel plan for this employee in {tpMonth.monthLong}. Try selecting
              another colleague.
            </p>
          </div>
        </div>
      {/if}
    </div>
  </main>
</div>
