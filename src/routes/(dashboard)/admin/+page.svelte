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

import CalendarIcon from "@lucide/svelte/icons/calendars"
import NotebookTabsIcon from "@lucide/svelte/icons/notebook-tabs"

let { data } = $props()
let {
  userProfile: userProfilePromise,
  employees,
  today,
  thisMonth,
  upcomingMonth,
  tasks
} = $derived(data)

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

  <div class="my-16 grid grid-cols-1 place-content-center gap-4 px-16 md:grid-cols-2">
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
        {#await getTravelPlansForMonth(thisMonth.toISODate())}
          <Skeleton class="h-12 w-full" />
        {:then plans}
          <Item.Group>
            {#each plans as plan, i (plan.id)}
              <Item.Root>
                <Item.Content>
                  <TravelPlanCard travelPlan={plan} />
                </Item.Content>
              </Item.Root>
              {#if i !== (plans ?? []).length - 1}
                <Item.Separator />
              {/if}
            {:else}
              <Empty.Root>
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
        {:catch error}
          <p>
            Error loading Travel Plans: {error}
          </p>
        {/await}
      </Card.Content>
    </Card.Root>

    <!-- Daily Reports List -->
    <Card.Root class="mx-auto w-full max-w-xl">
      <Card.Header>
        <Card.Title>Daily Reports for Today</Card.Title>
        <Card.Description>Latest reports submitted</Card.Description>
        <Card.Action>
          <Button variant="link" href={resolve("/admin/dailyreport")}>View All</Button>
        </Card.Action>
      </Card.Header>
      <Separator />
      <Card.Content class="h-full">
        {#await getDailyReportsForDate(today.toISODate())}
          <Skeleton class="h-12 w-full" />
        {:then reports}
          <Item.Group class="h-full">
            {#each reports as report, i (report.id)}
              <Item.Root>
                <Item.Content>
                  <DailyReportCard dailyReport={report} />
                </Item.Content>
              </Item.Root>
              {#if i !== (reports ?? []).length - 1}
                <Item.Separator />
              {/if}
            {:else}
              <Empty.Root class="h-full">
                <Empty.Header>
                  <Empty.Media variant="icon">
                    <NotebookTabsIcon />
                  </Empty.Media>
                  <Empty.Title>0 Daily Reports</Empty.Title>
                  <Empty.Description>No daily report has been created yet.</Empty.Description>
                </Empty.Header>
              </Empty.Root>
            {/each}
          </Item.Group>
        {:catch error}
          <p>
            Error loading Daily Reports: {error}
          </p>
        {/await}
      </Card.Content>
    </Card.Root>

    <!-- Employees-->
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
      <Separator />
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
          <p>
            Error loading Tasks: {error}
          </p>
        {/await}
      </Card.Content>
    </Card.Root>
  </div>
</div>
