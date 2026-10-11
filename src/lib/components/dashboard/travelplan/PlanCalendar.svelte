<script lang="ts">
import LocationSelectComboBox from "$lib/components/dashboard/LocationSelectComboBox.svelte"
import Calendar from "@ui/calendar/calendar.svelte"
import PopoverContent from "@ui/popover/popover-content.svelte"
import PopoverTrigger from "@ui/popover/popover-trigger.svelte"
import Popover from "@ui/popover/popover.svelte"
import * as Select from "@ui/select"

import { TIMEZONE } from "$lib/constants"
import { DayType } from "$lib/types"

import { isWeekend, parseDate } from "@internationalized/date"
import ArrowRight from "@lucide/svelte/icons/arrow-right"
import Holidays from "date-holidays"
import { DateTime } from "luxon"

import { dayTypeBadge, routeBadge, statsBadge } from "../snippets.svelte"
import type { DateValue } from "@internationalized/date"
import type { addTravelPlan } from "$lib/api/travelplan.remote"
import type { LocationWithName, RouteWithName } from "$lib/types"
import type { ClassValue } from "svelte/elements"

interface Props {
  className?: ClassValue
  month: DateTime
  days: DateTime<true>[]
  dayTypes: DayType[]
  routes: RouteWithName[]
  locations: LocationWithName[]
  planEntries: typeof addTravelPlan.fields.planEntries
  disabled: boolean
  onInput: () => void
}

let {
  className,
  month,
  days,
  dayTypes,
  routes,
  locations,
  planEntries,
  disabled,
  onInput,
  ...rest
}: Props = $props()

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

/**
 * Handles updating the location for a given day in the plan.
 * Updates the routeId if a matching route exists
 * @param idx - The index of the day in the plan.
 * @param newSrcId - The new source location ID.
 * @param newDestId - The new destination location ID.
 */
function handleLocationUpdate(idx: number, newSrcId?: string, newDestId?: string) {
  const currentSrc = newSrcId !== undefined ? newSrcId : (planEntries[idx].srcLocId.value() ?? "")
  const currentDest =
    newDestId !== undefined ? newDestId : (planEntries[idx].destLocId.value() ?? "")

  if (newSrcId !== undefined) {
    planEntries[idx].srcLocId.set(newSrcId)
  }
  if (newDestId !== undefined) {
    planEntries[idx].destLocId.set(newDestId)
  }

  if (currentSrc && currentDest) {
    const matched = routes.find((r) => r.srcLoc.id === currentSrc && r.destLoc.id === currentDest)
    planEntries[idx].routeId.set(matched ? matched.id : "")
  } else {
    planEntries[idx].routeId.set("")
  }

  onInput()
}

let workDaysCount = $derived(
  planEntries.value()?.reduce((acc, entry) => {
    if (!entry) return acc
    return acc + (entry.dayType === DayType.WORK ? 1 : 0)
  }, 0) ?? 0
)
let holidayDaysCount = $derived(
  planEntries.value()?.reduce((acc, entry) => {
    if (!entry) return acc
    return acc + (entry.dayType === DayType.HOLIDAY ? 1 : 0)
  }, 0) ?? 0
)
let leaveDaysCount = $derived(
  planEntries.value()?.reduce((acc, entry) => {
    if (!entry) return acc
    return acc + (entry.dayType === DayType.LEAVE ? 1 : 0)
  }, 0) ?? 0
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

<div class={["w-full", className]}>
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
    {disabled}>
    {#snippet day({ day, outsideMonth })}
      {const dayIsWeekend = isWeekend(day, "en-IN")}
      {const holidayInfo = hd.isHoliday(day.toDate(TIMEZONE))}
      <!-- TODO: make this better -->
      {const i = days.findIndex((d) => d.day === day.day && !outsideMonth)}
      {const thisDayType = $derived(planEntries[i].dayType.value() ?? DayType.WORK)}
      {const thisRouteId = $derived(planEntries[i].routeId.value() ?? null)}
      {const thisSrcLocId = $derived(planEntries[i].srcLocId.value() ?? null)}
      {const thisDestLocId = $derived(planEntries[i].destLocId.value() ?? null)}

      {const resolvedExistingRoute = $derived.by(() => {
        if (!thisSrcLocId || !thisDestLocId) return null
        return (
          routes.find((r) => r.srcLoc.id === thisSrcLocId && r.destLoc.id === thisDestLocId) ?? null
        )
      })}

      {const thisRoute = $derived.by<RouteWithName | null>(() => {
        if (resolvedExistingRoute) return resolvedExistingRoute
        if (thisRouteId) {
          const r = routes.find((r) => r.id === thisRouteId)
          if (r) return r
        }
        if (thisSrcLocId && thisDestLocId) {
          const src = locations.find((l) => l.id === thisSrcLocId)
          const dest = locations.find((l) => l.id === thisDestLocId)
          if (src && dest) {
            return {
              id: "",
              distanceKm: 0,
              srcLoc: { id: src.id, name: src.name },
              destLoc: { id: dest.id, name: dest.name }
            }
          }
        }
        return null
      })}

      {const isNewRoute = $derived(
        Boolean(thisSrcLocId && thisDestLocId && !resolvedExistingRoute)
      )}
      {const hasErrors = $derived((planEntries[i].allIssues()?.length ?? 0) > 0)}

      {#if !outsideMonth}
        <input {...planEntries[i].date.as("hidden", days[i].toISODate())} />
        <input {...planEntries[i].dayType.as("hidden", thisDayType)} />
        <input hidden {...planEntries[i].routeId.as("text")} value={thisRouteId ?? ""} />
        <input hidden {...planEntries[i].srcLocId.as("text")} value={thisSrcLocId ?? ""} />
        <input hidden {...planEntries[i].destLocId.as("text")} value={thisDestLocId ?? ""} />
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

            <div class="space-y-4 p-4 pt-0">
              <Select.Root
                type="single"
                onValueChange={() => onInput()}
                bind:value={
                  () => thisDayType,
                  (value) => {
                    planEntries[i].dayType.set(value)
                    if (value !== DayType.WORK) {
                      planEntries[i].routeId.set("")
                      planEntries[i].srcLocId.set("")
                      planEntries[i].destLocId.set("")
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
                {#each [...(planEntries[i].routeId.issues() ?? []), ...(planEntries[i].srcLocId.issues() ?? []), ...(planEntries[i].destLocId.issues() ?? [])] as issue}
                  <p class="ms-2 text-sm text-destructive">
                    {issue.message}
                  </p>
                {/each}

                <div class="space-y-3">
                  <div class="space-y-1">
                    <span
                      class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      From
                    </span>
                    <LocationSelectComboBox
                      {locations}
                      placeholder="Select source..."
                      value={thisSrcLocId ?? undefined}
                      onValueChange={(val) => handleLocationUpdate(i, val, undefined)}
                      {disabled} />
                  </div>

                  <div class="space-y-1">
                    <span
                      class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      To
                    </span>
                    <LocationSelectComboBox
                      {locations}
                      placeholder="Select destination..."
                      value={thisDestLocId ?? undefined}
                      onValueChange={(val) => handleLocationUpdate(i, undefined, val)}
                      {disabled} />
                  </div>

                  {#key [thisSrcLocId, thisDestLocId, resolvedExistingRoute, isNewRoute]}
                    {#if resolvedExistingRoute}
                      <div class="p-2.5">
                        <div class="flex items-center gap-1.5 font-medium text-foreground">
                          <span>{resolvedExistingRoute.srcLoc.name}</span>
                          <ArrowRight class="size-3.5 text-muted-foreground" />
                          <span>{resolvedExistingRoute.destLoc.name}</span>
                        </div>
                        {#if resolvedExistingRoute.distanceKm > 0}
                          <div class="mt-1 text-muted-foreground">
                            Distance: <span class="font-semibold text-foreground">
                              {resolvedExistingRoute.distanceKm} km
                            </span>
                          </div>
                        {/if}
                      </div>
                    {:else if isNewRoute}
                      {const srcLocObj = locations.find((l) => l.id === thisSrcLocId)}
                      {const destLocObj = locations.find((l) => l.id === thisDestLocId)}
                      <div class="p-2.5">
                        <div class="flex items-center gap-1.5 font-medium">
                          <span>{srcLocObj?.name ?? "Source"}</span>
                          <ArrowRight class="size-3.5 opacity-70" />
                          <span>{destLocObj?.name ?? "Destination"}</span>
                        </div>
                        <p class="mt-1 text-sm text-muted-foreground">
                          A <b>new</b> route will be created
                        </p>
                      </div>
                    {/if}
                  {/key}
                </div>
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
