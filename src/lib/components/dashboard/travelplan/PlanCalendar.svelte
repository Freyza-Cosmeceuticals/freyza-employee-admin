<script lang="ts">
import RouteSelectComboBox from "@/components/dashboard/RouteSelectComboBox.svelte"
import Calendar from "@/components/ui/calendar/calendar.svelte"
import PopoverContent from "@/components/ui/popover/popover-content.svelte"
import PopoverTrigger from "@/components/ui/popover/popover-trigger.svelte"
import Popover from "@/components/ui/popover/popover.svelte"
import * as Select from "@/components/ui/select"

import { TIMEZONE } from "@/constants"
import { DayType } from "@/generated/prisma/browser"

import { isWeekend, parseDate } from "@internationalized/date"
import Holidays from "date-holidays"
import { DateTime } from "luxon"

import { dayTypeBadge, routeBadge, statsBadge } from "./snippets.svelte"
import type { addTravelPlan } from "@/api/travelplan.remote"
import type { RouteWithName } from "@/types"
import type { DateValue } from "@internationalized/date"

interface Props {
  month: DateTime
  days: DateTime<true>[]
  dayTypes: string[]
  routes: RouteWithName[]
  planEntries: typeof addTravelPlan.fields.planEntries
  disabled: boolean
  onInput: () => void
}

let { month, days, dayTypes, routes, planEntries, disabled, onInput }: Props = $props()

let selectedMonth = $derived(parseDate(month.toISODate()!))

let openPopovers = $state<Record<string, boolean>>({})

const hd = new Holidays("IN")
const setInitialDays = () => {
  days.forEach((day, idx) => {
    // 6 is saturday, 7 is sunday
    if (day.weekday === 6 || day.weekday === 7) {
      planEntries[idx].dayType.set(DayType.HOLIDAY)
    } else if (hd.isHoliday(day.toJSDate())) {
      planEntries[idx].dayType.set(DayType.HOLIDAY)
    } else {
      planEntries[idx].dayType.set(DayType.WORK)
    }
  })
}

setInitialDays()

let workDaysCount = $derived(
  planEntries.value()?.reduce((acc, entry) => acc + (entry.dayType === DayType.WORK ? 1 : 0), 0) ??
    0
)
let holidayDaysCount = $derived(
  planEntries
    .value()
    ?.reduce((acc, entry) => acc + (entry.dayType === DayType.HOLIDAY ? 1 : 0), 0) ?? 0
)
let leaveDaysCount = $derived(
  planEntries.value()?.reduce((acc, entry) => acc + (entry.dayType === DayType.LEAVE ? 1 : 0), 0) ??
    0
)

const getDateKey = (date: DateValue): string =>
  `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`

const formatDateDisplay = (date: DateValue): string =>
  new Date(date.year, date.month - 1, date.day).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  })

// $inspect(openPopovers)
// $inspect(days)
// $inspect(planEntries.allIssues()).with(console.log)
</script>

<div class="w-full">
  <div class="container my-2 flex flex-row justify-center gap-4 p-4">
    {@render statsBadge(DayType.WORK, workDaysCount, true)}
    {@render statsBadge(DayType.HOLIDAY, holidayDaysCount, true)}
    {@render statsBadge(DayType.LEAVE, leaveDaysCount, true)}
  </div>
  <Calendar
    type="single"
    value={undefined}
    placeholder={selectedMonth}
    class="mx-auto  w-min rounded-lg border border-border bg-card shadow-sm [--cell-size:--spacing(32)]"
    initialFocus={false}
    disableDaysOutsideMonth={true}
    preventDeselect={true}
    weekdayFormat="short"
    {disabled}>
    {#snippet day({ day, outsideMonth })}
      {@const dayIsWeekend = isWeekend(day, "en-IN")}
      {@const holidayInfo = hd.isHoliday(day.toDate(TIMEZONE))}
      <!-- TODO: make this better -->
      {@const i = days.findIndex((d) => d.day === day.day && !outsideMonth)}
      {@const thisDayType = planEntries[i].dayType.value() ?? DayType.WORK}
      {@const thisRouteId = planEntries[i].routeId.value() ?? null}
      {@const thisRoute = routes.find((r) => r.id === thisRouteId) ?? null}
      {@const hasErrors = (planEntries[i].allIssues()?.length ?? 0) > 0}

      {#if !outsideMonth}
        <input {...planEntries[i].date.as("hidden", days[i].toISODate())} />
        <input {...planEntries[i].dayType.as("hidden", thisDayType)} />
        <input hidden {...planEntries[i].routeId.as("text")} value={thisRouteId} />
      {/if}

      <Popover
        bind:open={
          () => openPopovers[getDateKey(day)] ?? false,
          (value) => {
            openPopovers[getDateKey(day)] = value
          }
        }>
        <PopoverTrigger
          class={[
            "h-34 w-32 p-4 text-sm font-normal text-foreground transition-colors hover:text-foreground",
            "bg-transparent hover:bg-muted/50 disabled:hover:bg-transparent",
            "relative inline-flex flex-col items-end justify-start gap-2",
            // "rounded-md",
            "border border-s-0 border-t-0 border-border",
            "disabled:pointer-events-none disabled:opacity-40",
            hasErrors && "hover:bg-destructive/20"
            // "outline-destructive/50 hover:bg-destructive/20 outline-2 -outline-offset-1",
          ]}
          disabled={outsideMonth}>
          <!-- error overlay outline, under probation, change date color looks more nice -->
          {#if hasErrors}
            <div
              class="absolute top-2 left-2 h-[calc(100%-var(--spacing)*4)] w-[calc(100%-var(--spacing)*4)] rounded-md outline-2 outline-destructive/50 hover:bg-destructive/20">
            </div>
          {/if}

          <strong class={["mb-2", hasErrors && "text-destructive"]}>{day.day}</strong>
          {#if !outsideMonth}
            {@render dayTypeBadge(thisDayType)}
            {#if thisDayType === DayType.WORK}
              {@render routeBadge(thisRoute)}
            {/if}
          {/if}
        </PopoverTrigger>

        {#if !outsideMonth}
          <PopoverContent class="w-80 p-0">
            <div class="border-b border-border bg-muted/40 p-4">
              <h3 class="text-base font-semibold text-foreground">
                {formatDateDisplay(day)}
              </h3>
              {#if holidayInfo || dayIsWeekend}
                <ul class="text-sm text-muted-foreground">
                  {#if holidayInfo}
                    {#each holidayInfo as holiday}
                      <li>{holiday.name} ({holiday.type})</li>
                    {/each}
                  {/if}
                  {#if dayIsWeekend}
                    <li>Weekend</li>
                  {/if}
                </ul>
              {/if}
            </div>

            <div class="space-y-4 p-4">
              <Select.Root
                type="single"
                onValueChange={() => onInput()}
                bind:value={
                  () => thisDayType,
                  (value) => {
                    planEntries[i].dayType.set(value)
                    // selectedDayTypes[i] = value
                    if (value !== DayType.WORK) {
                      planEntries[i].routeId.set("")
                      // selectedRoutes[i] = null
                    }
                  }
                }
                {disabled}
                required>
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
                {#each planEntries[i].routeId.issues() as issue}
                  <p class="ms-2 text-sm text-destructive">
                    {issue.message}
                  </p>
                {/each}

                <RouteSelectComboBox
                  {routes}
                  bind:value={
                    () => thisRouteId ?? undefined,
                    (value) => {
                      planEntries[i].routeId.set(value ?? "")
                      // selectedRoutes[i] = value ?? null
                    }
                  }
                  {disabled}
                  onValueChange={() => onInput()} />
              {:else}
                <p class="text-sm text-muted-foreground">No Route to be selected</p>
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
