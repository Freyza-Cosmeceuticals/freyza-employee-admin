<script lang="ts">
import { goto } from "$app/navigation"
import { resolve } from "$app/paths"
import { addTravelPlan } from "@/api/travelplan.remote.js"
import PlanCalendar from "@/components/dashboard/travelplan/PlanCalendar.svelte"
import { Button } from "@/components/ui/button"
import * as Card from "@/components/ui/card"
import * as Select from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner/index.js"
import { DayType } from "@db/browser"
import type { RemoteFormIssue } from "@sveltejs/kit"
import { DateTime, Interval } from "luxon"
import { toast } from "svelte-sonner"

let { data } = $props()
let { user, employees, routes, today } = $derived(data)

const nextMonth = $derived(today.plus({ months: 1 }))
const days = $derived(
  Interval.fromDateTimes(nextMonth.startOf("month"), nextMonth.endOf("month"))
    .splitBy({ day: 1 })
    .map((d) => d.start!),
)

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
        const toastId = toast.loading("Hold tight! Creating Travel Plan...", {
          duration: 15000,
        })
        console.debug("Submitting data", data)

        try {
          await submit()

          if (addTravelPlan.result?.success && addTravelPlan.result.data) {
            toast.success(addTravelPlan.result.message, {
              id: toastId,
              description: `Travel Plan created for ${DateTime.fromJSDate(addTravelPlan.result.data.month).monthLong} ${addTravelPlan.result.data.month.getFullYear()}.`,
              duration: undefined,
            })

            console.log(addTravelPlan.result.message, addTravelPlan.result.data)
            goto(resolve("/admin/travelplan"))
          } else {
            if (addTravelPlan.fields.allIssues()) {
              toast.error("Look for issues in the calendar", { id: toastId, duration: undefined })
              console.error(addTravelPlan.fields.allIssues())
            } else {
              toast.error(addTravelPlan.result?.message ?? "An Internal Error Occurred", {
                id: toastId,
                duration: undefined,
              })
              console.error(addTravelPlan.result?.message)
            }
          }
        } catch (error) {
          toast.error("An Internal Error Occurred", {
            id: toastId,
            duration: undefined,
          })
          console.error(error)
        }
      })}
    >
      <Card.Root class="w-full">
        <Card.Header>
          <Card.Title class="text-xl font-bold">
            {nextMonth.monthLong}
            {nextMonth.year}
            <input {...addTravelPlan.fields.month.as("hidden", days[0].toISODate())} />
            <input {...addTravelPlan.fields.createdById.as("hidden", user.id)} />
          </Card.Title>
          <Card.Action>
            <!-- <EmployeeSelectComboBox /> -->
            <Select.Root
              type="single"
              disabled={addTravelPlan.pending > 0}
              name={addTravelPlan.fields.employeeId.as("select").name}
              onValueChange={() => addTravelPlan.validate()}
              bind:value={
                () => addTravelPlan.fields.employeeId.value(),
                (newVal) => {
                  addTravelPlan.fields.employeeId.set(newVal)
                }
              }
              required
            >
              <Select.Trigger>
                {employees.find((emp) => emp.id == addTravelPlan.fields.employeeId.value())?.name ??
                  "Select Employee"}
              </Select.Trigger>
              <Select.Content>
                {#each employees as emp (emp.id)}
                  <Select.Item value={emp.id} label={emp.name} />
                {/each}
              </Select.Content>
            </Select.Root>
          </Card.Action>
        </Card.Header>
        <Card.Content class="space-y-4">
          <div class="text-muted-foreground text-sm">
            💡 <strong>Tip:</strong> Click on calendar cells to change each day plan.
          </div>
          <PlanCalendar
            month={nextMonth}
            {days}
            {dayTypes}
            {routes}
            planEntries={addTravelPlan.fields.planEntries}
            disabled={addTravelPlan.pending > 0}
            onInput={() => addTravelPlan.validate()}
          />
        </Card.Content>
        <Card.Footer>
          <Button type="submit" class="mt-8 w-full" disabled={addTravelPlan.pending > 0}>
            {#if addTravelPlan.pending > 0}
              <Spinner />
            {/if}
            Create Travel Plan
          </Button>
        </Card.Footer>
      </Card.Root>
    </form>
  </div>
</div>
