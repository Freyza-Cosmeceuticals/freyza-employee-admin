<script lang="ts">
import Calendar from "@/components/ui/calendar/calendar.svelte"
import Popover from "@/components/ui/popover/popover.svelte"
import PopoverTrigger from "@/components/ui/popover/popover-trigger.svelte"
import PopoverContent from "@/components/ui/popover/popover-content.svelte"
import { isWeekend, parseDate, type DateValue } from "@internationalized/date"
import { DateTime } from "luxon"
import type { addTravelPlan } from "@/api/travelplan.remote"
import { DayType, type Route } from "@/generated/prisma/browser"
import * as Select from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface Props {
  month: DateTime
  days: DateTime[]
  dayTypes: string[]
  routes: Route[]
  planEntries: typeof addTravelPlan.fields.planEntries
  disabled: boolean
}

let { month, days, dayTypes, routes, planEntries, disabled }: Props = $props()
let selectedMonth = $derived(parseDate(month.toISODate()!))

let openPopovers = $state<Record<string, boolean>>({})

// form submission values
let selectedDayTypes = $state<Record<number, DayType>>({})
let selectedRoutes = $state<Record<number, string | null>>({})

const getDateKey = (date: DateValue): string =>
  `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`

const formatDateDisplay = (date: DateValue): string =>
  new Date(date.year, date.month - 1, date.day).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

// $inspect(selectedDayTypes)
// $inspect(openPopovers)
// $inspect(days)
</script>

{#snippet dayTypeBadge(dt: DayType)}
  {#if dt == DayType.WORK}
    <Badge variant="default" class="w-full rounded-sm">WORK</Badge>
  {:else if dt == DayType.LEAVE}
    <Badge class="w-full rounded-sm bg-blue-600 dark:bg-sky-400">LEAVE</Badge>
  {:else if dt == DayType.HOLIDAY}
    <Badge class="w-full rounded-sm bg-green-600 dark:bg-green-400">HOLIDAY</Badge>
  {:else}
    <Badge variant="outline" class="w-full rounded-sm">UNKNOWN</Badge>
  {/if}
{/snippet}

{#snippet routeBadge(route: Route | null)}
  {#if route}
    <Badge class="w-full rounded-sm bg-cyan-500">{route.distanceKm}</Badge>
  {:else}
    <Badge variant="destructive" class="w-full rounded-sm">NO ROUTE</Badge>
  {/if}
{/snippet}

<div class="w-full">
  <Calendar
    type="single"
    value={undefined}
    placeholder={selectedMonth}
    class="border-border  bg-card mx-auto w-min rounded-lg border shadow-sm [--cell-size:--spacing(32)]"
    initialFocus={false}
    disableDaysOutsideMonth={true}
    preventDeselect={true}
    weekdayFormat="short"
    {disabled}
  >
    {#snippet day({ day, outsideMonth })}
      {@const dayIsWeekend = isWeekend(day, "en-IN")}
      <!-- TODO: make this better -->
      {@const i = days.findIndex((d) => d.day === day.day && !outsideMonth)}
      {@const thisDayType = selectedDayTypes[i] ?? DayType.WORK}
      {@const thisRouteId = selectedRoutes[i] ?? null}
      {@const thisRoute = routes.find((r) => r.id === thisRouteId) ?? null}

      {#if !outsideMonth}
        <input hidden {...planEntries[i].date.as("date")} value={days[i].toISODate()} />
        <input hidden {...planEntries[i].dayType.as("text")} value={thisDayType} />
        <input hidden {...planEntries[i].routeId.as("text")} value={thisRouteId} />
      {/if}

      <Popover
        bind:open={
          () => openPopovers[getDateKey(day)] ?? false,
          (value) => {
            openPopovers[getDateKey(day)] = value
          }
        }
      >
        <PopoverTrigger
          class={[
            "text-foreground hover:text-foreground h-34 w-32 p-4 text-sm font-normal transition-colors",
            "hover:bg-muted/50 bg-transparent disabled:hover:bg-transparent",
            "relative inline-flex flex-col items-end justify-start gap-2",
            // "rounded-md",
            "border-border border border-s-0 border-t-0",
            "disabled:pointer-events-none disabled:opacity-40",
          ]}
          disabled={outsideMonth}
        >
          <strong class="mb-2">{day.day}</strong>
          {#if !outsideMonth}
            {@render dayTypeBadge(thisDayType)}
            {#if thisDayType === DayType.WORK}
              {@render routeBadge(thisRoute)}
            {/if}
            <!-- <span> Hello </span> -->
          {/if}
        </PopoverTrigger>

        {#if !outsideMonth}
          <PopoverContent class="w-80 p-0">
            <div class="border-border bg-muted/40 border-b p-4">
              <h3 class="text-foreground text-base font-semibold">
                {formatDateDisplay(day)}
              </h3>
            </div>

            <div class="space-y-4 p-4">
              <Select.Root
                type="single"
                {disabled}
                bind:value={
                  () => thisDayType,
                  (value) => {
                    selectedDayTypes[i] = value
                    if (value !== DayType.WORK) {
                      selectedRoutes[i] = null
                    }
                  }
                }
                required
              >
                <Select.Trigger>
                  {thisDayType.toUpperCase()}
                </Select.Trigger>
                <Select.Content>
                  {#each dayTypes as dt (dt)}
                    <Select.Item value={dt}>{dt.toUpperCase()}</Select.Item>
                  {/each}
                </Select.Content>
              </Select.Root>

              {#if thisDayType === DayType.WORK}
                <Select.Root
                  type="single"
                  {disabled}
                  bind:value={
                    () => thisRouteId ?? undefined,
                    (value) => {
                      selectedRoutes[i] = value ?? null
                    }
                  }
                  required
                >
                  <Select.Trigger>
                    {thisRoute?.id.substring(0, 5).toUpperCase() || "Select a Route"}
                  </Select.Trigger>
                  <Select.Content>
                    {#each routes as rt (rt.id)}
                      <Select.Item value={rt.id}>
                        {rt.srcLocId.substring(0, 5)} to {rt.destLocId.substring(0, 5)} ({rt.distanceKm}km)
                      </Select.Item>
                    {/each}
                  </Select.Content>
                </Select.Root>
              {:else}
                <p class="text-muted-foreground text-sm">No Route to be selected</p>
              {/if}
            </div>
          </PopoverContent>
        {/if}
      </Popover>
    {/snippet}
  </Calendar>
</div>

<style lang="postcss">
:global([data-calendar-prev-button], [data-calendar-next-button]) {
  @apply hidden;
}

:global([data-calendar-header]) {
  @apply hidden;
}

:global([data-calendar-grid]) {
  @apply w-full;
}
</style>
