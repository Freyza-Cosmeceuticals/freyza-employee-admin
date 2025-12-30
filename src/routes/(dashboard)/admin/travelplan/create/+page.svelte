<script lang="ts">
import { dev } from "$app/environment"
import { goto } from "$app/navigation"
import { resolve } from "$app/paths"

import EmployeeSelectComboBox from "@/components/dashboard/EmployeeSelectComboBox.svelte"
import PlanCalendar from "@/components/dashboard/travelplan/PlanCalendar.svelte"
import FormDebug from "@/components/debug/FormDebug.svelte"
import * as Alert from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import * as Card from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

import { addTravelPlan } from "@/api/travelplan.remote"
import { DayType } from "@db/browser"

import InfoIcon from "@lucide/svelte/icons/info"
import { DateTime, Interval } from "luxon"
import { toast } from "svelte-sonner"

import type { RemoteFormIssue } from "@sveltejs/kit"

let { data } = $props()
let { user, employees, routes, today } = $derived(data)

const nextMonth = $derived(today.plus({ months: 1 }))
const days = $derived(
  Interval.fromDateTimes(nextMonth.startOf("month"), nextMonth.endOf("month"))
    .splitBy({ day: 1 })
    .map((d) => d.start!)
)

const dayTypes = [DayType.WORK, DayType.LEAVE, DayType.HOLIDAY]

function debugFill() {
  addTravelPlan.fields.planEntries.set(
    days.map((d) => {
      const dayType = dayTypes[Math.floor(Math.random() * dayTypes.length)]
      const routeId =
        dayType === DayType.WORK ? routes[Math.floor(Math.random() * routes.length)].id : undefined
      return {
        date: d.toISODate(),
        dayType,
        routeId: routeId
      }
    })
  )
  addTravelPlan.validate()
  toast.success("Debug Fill successful")
}

let employeeSelectError = $state<string | null>(null)

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

  {#if employees.length === 0}
    <Alert.Root class="mx-auto max-w-5xl">
      <InfoIcon />
      <Alert.Title>All Travel Plans Created</Alert.Title>
      <Alert.Description>
        Travel plans for all active employees have been created for the next month. No additional
        travel plans can be created until the next month.
      </Alert.Description>
    </Alert.Root>
  {:else}
    <div class="mx-auto max-w-5xl">
      <!-- TODO: Add .preflight here to do preflight validation -->
      <form
        {...addTravelPlan.enhance(async ({ submit, data }) => {
          employeeSelectError = null

          console.log(data)

          if (!data.employeeId) {
            console.log(data.employeeId)
            employeeSelectError = "Please select an Employee"
            toast.error("Please select an Employee")
            return
          }

          const toastId = toast.loading("Hold tight! Creating Travel Plan...", {
            duration: 15000
          })
          console.log("Submitting data", data)

          try {
            await submit()

            if (addTravelPlan.result?.success && addTravelPlan.result.data) {
              const monthName = DateTime.fromJSDate(addTravelPlan.result.data.month).monthLong
              const year = addTravelPlan.result.data.month.getFullYear()
              toast.success(addTravelPlan.result.message, {
                id: toastId,
                description: `Travel Plan created for ${monthName} ${year}.`,
                duration: undefined
              })

              console.log(addTravelPlan.result.message, addTravelPlan.result.data)
              goto(resolve("/admin/travelplan"))
            } else {
              if (addTravelPlan.fields.allIssues()) {
                toast.error("Look for issues in the calendar", { id: toastId, duration: undefined })
                console.debug(addTravelPlan.fields.allIssues())
              } else {
                toast.error(addTravelPlan.result?.message ?? "An Internal Error Occurred", {
                  id: toastId,
                  duration: undefined
                })
                console.error(addTravelPlan.result?.message)
              }
            }
          } catch (error) {
            toast.error("An Internal Error Occurred", {
              id: toastId,
              duration: undefined
            })
            console.error(error)
          }
        })}>
        <Card.Root class="w-full">
          <Card.Header>
            <Card.Title class="text-xl font-bold">
              {nextMonth.monthLong}
              {nextMonth.year}
              <input {...addTravelPlan.fields.month.as("hidden", days[0].toISODate())} />
              <input {...addTravelPlan.fields.createdById.as("hidden", user.id)} />
            </Card.Title>
            <Card.Action>
              <div class="flex flex-col items-end justify-center gap-2">
                <EmployeeSelectComboBox
                  {employees}
                  bind:value={
                    () => addTravelPlan.fields.employeeId.value(),
                    (newVal) => {
                      addTravelPlan.fields.employeeId.set(newVal)
                    }
                  }
                  disabled={addTravelPlan.pending > 0}
                  error={(addTravelPlan.fields.employeeId.issues() ?? []).length > 0 ||
                    employeeSelectError !== null}
                  onValueChange={() => {
                    employeeSelectError = null
                    // don't validate yet, whole form is probably left
                    // addTravelPlan.validate()
                  }} />

                <!-- need this since employee select box is not an form element -->
                <input hidden {...addTravelPlan.fields.employeeId.as("text")} />

                {#if employeeSelectError}
                  <p class="text-end text-sm text-destructive">{employeeSelectError}</p>
                {/if}
                {#each addTravelPlan.fields.employeeId.issues() as issue}
                  <p class="text-end text-sm text-destructive">{issue.message}</p>
                {/each}
              </div>
            </Card.Action>
          </Card.Header>
          <Card.Content class="space-y-4">
            <div class="text-sm text-muted-foreground">
              <strong>Tip:</strong> Click on calendar cells to change each day plan. &nbsp;
              {#if dev}
                <Button variant="ghost" size="sm" onclick={debugFill}>Debug Fill</Button>
              {/if}
            </div>
            <PlanCalendar
              month={nextMonth}
              {days}
              {dayTypes}
              {routes}
              planEntries={addTravelPlan.fields.planEntries}
              disabled={addTravelPlan.pending > 0}
              onInput={() => addTravelPlan.validate()} />
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

    {#if dev}
      <FormDebug form={addTravelPlan} />
    {/if}
  {/if}
</div>
