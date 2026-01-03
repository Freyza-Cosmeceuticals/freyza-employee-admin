<script lang="ts">
import Calendar from "@ui/calendar/calendar.svelte"
import PopoverContent from "@ui/popover/popover-content.svelte"
import PopoverTrigger from "@ui/popover/popover-trigger.svelte"
import Popover from "@ui/popover/popover.svelte"

import { TIMEZONE } from "$lib/constants"
import { DayType } from "@db/browser"

import { isWeekend, parseDate } from "@internationalized/date"
import Holidays from "date-holidays"
import { DateTime } from "luxon"

import { dayTypeBadge, routeBadge, statsBadge } from "./snippets.svelte"
import type { DateValue } from "@internationalized/date"
import type { TravelPlanEntryWithRoute } from "$lib/types"

interface Props {
  month: DateTime
  dayTypes: string[]
  planEntries: TravelPlanEntryWithRoute[]
}

let { month, dayTypes, planEntries }: Props = $props()

let selectedMonth = $derived(parseDate(month.toISODate()!))
let openPopovers = $state<Record<string, boolean>>({})

const hd = new Holidays("IN")

let workDaysCount = $derived(
  planEntries.reduce((acc, entry) => acc + (entry.dayType === DayType.WORK ? 1 : 0), 0) ?? 0
)
let holidayDaysCount = $derived(
  planEntries.reduce((acc, entry) => acc + (entry.dayType === DayType.HOLIDAY ? 1 : 0), 0) ?? 0
)
let leaveDaysCount = $derived(
  planEntries.reduce((acc, entry) => acc + (entry.dayType === DayType.LEAVE ? 1 : 0), 0) ?? 0
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
    class="mx-auto w-min rounded-lg border border-border bg-card shadow-sm [--cell-size:--spacing(32)]"
    initialFocus={false}
    disableDaysOutsideMonth={true}
    preventDeselect={true}
    weekdayFormat="short"
    disabled>
    {#snippet day({ day, outsideMonth })}
      {@const dayIsWeekend = isWeekend(day, "en-IN")}
      {@const holidayInfo = hd.isHoliday(day.toDate(TIMEZONE))}
      <!-- TODO: make this better -->
      {@const i = planEntries.findIndex((d) => d.date.getDate() === day.day && !outsideMonth)}
      {@const thisDayType = planEntries[i]?.dayType || DayType.WORK}
      {@const thisRoute = planEntries[i]?.route}

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
            "disabled:pointer-events-none disabled:opacity-40"
          ]}
          disabled={outsideMonth}>
          <strong class="mb-2">{day.day}</strong>
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
              {@render dayTypeBadge(thisDayType)}

              {#if thisDayType === DayType.WORK}
                <p>
                  {`${thisRoute!.srcLoc.name} → ${thisRoute!.destLoc.name} (${thisRoute!.distanceKm}km)`}
                </p>
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
