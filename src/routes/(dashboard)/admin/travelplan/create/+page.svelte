<script lang="ts">
import { addTravelPlan } from "@/api/travelplan.remote.js"
import PlanCalendar from "@/components/dashboard/travelplan/PlanCalendar.svelte"
import { Button } from "@/components/ui/button"
import * as Card from "@/components/ui/card"
import * as Select from "@/components/ui/select"
import { DayType } from "@db/browser"
import type { RemoteFormIssue } from "@sveltejs/kit"
import { Interval } from "luxon"

let { data } = $props()
let { user, employees, routes, today } = $derived(data)

const nextMonth = $derived(today.plus({ months: 1 }))
const days = $derived(
  Interval.fromDateTimes(nextMonth.startOf("month"), nextMonth.endOf("month"))
    .splitBy({ day: 1 })
    .map((d) => d.start!),
)

// currently selected employee or "Select Employee"
let empLabel = $derived.by(() => {
  const found = employees.find((emp) => emp.id == addTravelPlan.fields.employeeId.value())
  if (found) {
    return found.name
  }

  return "Select Employee"
})

const dayTypes = [DayType.WORK, DayType.LEAVE, DayType.HOLIDAY]

// $inspect(nextMonth, days)
</script>

{#snippet errorListSnippet(issues: RemoteFormIssue[])}
  {#if issues.length > 0}
    <ul>
      {#each issues as issue}
        <li>{issue.message}</li>
      {/each}
    </ul>
  {:else}{/if}
{/snippet}

<svelte:head>
  <title>Create Travel Plan | Freyza Cosmeceuticals Employee System</title>
  <meta name="description" content="Create Travel Plan for Freyza Cosmeceuticals Employee System" />
</svelte:head>

<div class="h-auto w-full space-y-8 px-4 py-8">
  <Card.Root class="w-full border-0 bg-transparent shadow-none">
    <Card.Header>
      <Card.Title class="text-2xl">Create Travel Plan</Card.Title>
      <Card.Description>prepare to get them suffer</Card.Description>
    </Card.Header>
  </Card.Root>

  <div class="mx-auto max-w-5xl">
    <form
      {...addTravelPlan.enhance(async ({ submit, data }) => {
        console.debug("Submitting form")
        console.log(data)
        await submit()
      })}
    >
      <Card.Root class="w-full">
        <Card.Header>
          <Card.Title class="text-xl font-bold">
            {nextMonth.monthLong}
            {nextMonth.year}
            <input hidden {...addTravelPlan.fields.month.as("text")} value={days[0].toISO()} />
            <input hidden {...addTravelPlan.fields.createdById.as("text")} value={user?.id} />
          </Card.Title>
          <Card.Action>
            <!-- <EmployeeSelectComboBox /> -->
            <Select.Root
              type="single"
              disabled={addTravelPlan.pending > 0}
              name={addTravelPlan.fields.employeeId.as("select").name}
              bind:value={
                () => addTravelPlan.fields.employeeId.value(),
                (newVal) => {
                  addTravelPlan.fields.employeeId.set(newVal)
                }
              }
              required
            >
              <Select.Trigger>
                {empLabel}
              </Select.Trigger>
              <Select.Content>
                {#each employees as emp (emp.id)}
                  <Select.Item value={emp.id} label={emp.name} />
                {/each}
              </Select.Content>
            </Select.Root>
          </Card.Action>
        </Card.Header>
        <Card.Content>
          <PlanCalendar
            month={nextMonth}
            {days}
            {dayTypes}
            {routes}
            planEntries={addTravelPlan.fields.planEntries}
            disabled={addTravelPlan.pending > 0}
          />
        </Card.Content>
        <Card.Footer>
          <Button type="submit" class="mt-8 w-full">Create Travel Plan</Button>
        </Card.Footer>
      </Card.Root>
    </form>
  </div>
</div>
