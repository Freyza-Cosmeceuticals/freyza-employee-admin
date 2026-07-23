<script lang="ts">
import { resolve } from "$app/paths"

import AdminProfileCard from "$lib/components/dashboard/AdminProfileCard.svelte"
import DailyReportCard from "$lib/components/dashboard/dailyreport/DailyReportCard.svelte"
import EmployeeList from "$lib/components/dashboard/EmployeeList.svelte"
import TasksList from "$lib/components/dashboard/TasksList.svelte"
import TravelPlanCard from "$lib/components/dashboard/travelplan/TravelPlanCard.svelte"
import { Button } from "@ui/button"
import * as Card from "@ui/card"
import * as Empty from "@ui/empty"
import * as Item from "@ui/item"
import { Separator } from "@ui/separator"
import { Skeleton } from "@ui/skeleton"

import { getDailyReportsForDate } from "$lib/api/dailyreport.remote.js"
import { getTravelPlansForMonth } from "$lib/api/travelplan.remote.js"

import { getAllEmployees, getAllEmployeesCount } from "@/lib/api/employee.remote"
import { N_EMPLOYEES_HOME } from "@/lib/constants"
import CalendarIcon from "@lucide/svelte/icons/calendars"
import NotebookTabsIcon from "@lucide/svelte/icons/notebook-tabs"

let { data } = $props()
let { userProfile: userProfilePromise, today, thisMonth, upcomingMonth, tasks } = $derived(data)

let userProfile = $derived(await userProfilePromise)
</script>

<svelte:head>
  <title>Admin Dashboard | Freyza Cosmeceuticals Employee System</title>
  <meta
    name="description"
    content="Admin Dashboard page for Freyza Cosmeceuticals Employee System" />
</svelte:head>

<div class="h-auto w-full space-y-8 px-4 py-8">
  <!-- Admin Profile Section -->
  <AdminProfileCard {userProfile} />

  <div class="my-8 grid grid-cols-1 place-content-center gap-4 px-16 md:grid-cols-2">
    <!-- Upcoming Travel Plans -->
    <Card.Root class="mx-auto w-full max-w-xl">
      <Card.Header>
        <Card.Title>Travel Plans For {thisMonth.monthLong} {thisMonth.year}</Card.Title>
        <Card.Description>Travel Plans</Card.Description>
        <Card.Action>
          <Button variant="link" href={resolve("/admin/travelplan")}>View All</Button>
        </Card.Action>
      </Card.Header>

      <Separator />

      <Card.Content class="h-full">
        <svelte:boundary>
          {const travelPlans = $derived(
            (await getTravelPlansForMonth(thisMonth.toISODate())) ?? []
          )}

          <Item.Group>
            {#each travelPlans as plan, i (plan.id)}
              <Item.Root>
                <Item.Content>
                  <TravelPlanCard travelPlan={plan} />
                </Item.Content>
              </Item.Root>
              {#if i !== travelPlans.length - 1}
                <Item.Separator />
              {/if}
            {:else}
              <Empty.Root class="h-full">
                <Empty.Header>
                  <Empty.Media variant="icon">
                    <CalendarIcon />
                  </Empty.Media>
                  <Empty.Title>0 Travel Plans</Empty.Title>
                  <Empty.Description>You have no travel plans yet.</Empty.Description>
                </Empty.Header>
              </Empty.Root>
            {/each}
          </Item.Group>

          {#snippet pending()}
            <Skeleton class="h-12 w-full" />
          {/snippet}

          {#snippet failed(error, reset)}
            {@debug error}
            <p>
              Error loading Travel Plans
              <Button variant="outline" onclick={reset}>Retry</Button>
            </p>
          {/snippet}
        </svelte:boundary>
      </Card.Content>
    </Card.Root>

    <!-- Daily Reports List -->
    <Card.Root class="mx-auto w-full max-w-xl">
      <Card.Header>
        <Card.Title>Daily Reports for {today.day} {today.monthLong}</Card.Title>
        <Card.Description>Latest reports submitted</Card.Description>
        <Card.Action>
          <Button variant="link" href={resolve("/admin/dailyreport")}>View All</Button>
        </Card.Action>
      </Card.Header>

      <Separator />

      <Card.Content class="h-full">
        <svelte:boundary>
          {const dailyReports = $derived((await getDailyReportsForDate(today.toISODate())) ?? [])}

          <Item.Group class="h-full">
            {#each dailyReports as report, i (report.id)}
              <Item.Root>
                <Item.Content>
                  <DailyReportCard dailyReport={report} />
                </Item.Content>
              </Item.Root>
              {#if i !== dailyReports.length - 1}
                <Item.Separator />
              {/if}
            {:else}
              <Empty.Root class="h-full">
                <Empty.Header>
                  <Empty.Media variant="icon">
                    <NotebookTabsIcon />
                  </Empty.Media>
                  <Empty.Title>0 Daily Reports</Empty.Title>
                  <Empty.Description>No daily reports have been created yet.</Empty.Description>
                </Empty.Header>
              </Empty.Root>
            {/each}
          </Item.Group>

          {#snippet pending()}
            <Skeleton class="h-12 w-full" />
          {/snippet}

          {#snippet failed(error, reset)}
            {@debug error}
            <p>
              Error loading Daily Reports
              <Button variant="outline" onclick={reset}>Retry</Button>
            </p>
          {/snippet}
        </svelte:boundary>
      </Card.Content>
    </Card.Root>

    <!-- Employees-->
    <Card.Root class="mx-auto w-full max-w-xl">
      <Card.Header>
        <Card.Title>My Employees</Card.Title>
        <svelte:boundary>
          {const count = $derived(await getAllEmployeesCount())}

          <Card.Description>
            Your top
            {count}
            Employees
          </Card.Description>
          {#snippet pending()}
            <Skeleton class="inline-block h-2.5 w-8" />
          {/snippet}

          {#snippet failed(error)}
            {@debug error}
            0
          {/snippet}
        </svelte:boundary>
        <Card.Action>
          <Button variant="link" href={resolve("/admin/employees")}>View All</Button>
        </Card.Action>
      </Card.Header>

      <Separator />

      <Card.Content>
        <svelte:boundary>
          {const employees = $derived(await getAllEmployees(N_EMPLOYEES_HOME))}
          <EmployeeList {employees} />

          {#snippet pending()}
            <Skeleton class="h-12 w-full" />
          {/snippet}
          {#snippet failed(error, reset)}
            <p>
              Error loading employees: {error}
            </p>
            <Button onclick={reset} variant="secondary">Retry</Button>
          {/snippet}
        </svelte:boundary>
      </Card.Content>
    </Card.Root>

    <!-- Pending Tasks -->
    <Card.Root class="mx-auto w-full max-w-xl">
      <Card.Header>
        <Card.Title>Pending Tasks</Card.Title>
        <Card.Description>Upcoming work</Card.Description>
        <!-- <Card.Action>
          <Button variant="link" href={resolve("/admin/travelplan")}>View All</Button>
        </Card.Action> -->
      </Card.Header>

      <Separator />

      <Card.Content>
        {#await tasks}
          <Skeleton class="h-12 w-full" />
        {:then data}
          <TasksList tasks={data} />
        {:catch error}
          {@debug error}
          <p>Error loading Tasks</p>
        {/await}
      </Card.Content>
    </Card.Root>
  </div>
</div>
