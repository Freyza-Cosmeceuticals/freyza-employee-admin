<script lang="ts">
import type { addTravelPlan } from "@/api/travelplan.remote"
import { Badge } from "@/components/ui/badge"
import Calendar from "@/components/ui/calendar/calendar.svelte"
import PopoverContent from "@/components/ui/popover/popover-content.svelte"
import PopoverTrigger from "@/components/ui/popover/popover-trigger.svelte"
import Popover from "@/components/ui/popover/popover.svelte"
import * as Select from "@/components/ui/select"
import { DayType } from "@/generated/prisma/browser"
import type { RouteWithName } from "@/types"
import { isWeekend, parseDate, type DateValue } from "@internationalized/date"
import Holidays from "date-holidays"
import { DateTime } from "luxon"
import RouteSelectComboBox from "../RouteSelectComboBox.svelte"

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

const getInitialDays = () => {
  var hd = new Holidays("IN")

  return Object.fromEntries(
    days.map((day, idx) => {
      // 6 is saturday, 7 is sunday
      if (day.weekday === 6 || day.weekday === 7) return [idx, DayType.HOLIDAY]
      if (hd.isHoliday(day.toJSDate())) return [idx, DayType.HOLIDAY]
      return [idx, DayType.WORK]
    }),
  )
}

// form submission values
let selectedDayTypes = $state<Record<number, DayType>>(getInitialDays())
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
// $inspect(planEntries.allIssues()).with(console.log)
</script>

{#snippet dayTypeBadge(dt: DayType)}
  {#if dt == DayType.WORK}
    <Badge variant="default" class="w-full rounded-sm">WORK</Badge>
  {:else if dt == DayType.LEAVE}
    <Badge class="bg-freyza-badge-leave w-full rounded-sm">LEAVE</Badge>
  {:else if dt == DayType.HOLIDAY}
    <Badge class="bg-freyza-badge-holiday w-full rounded-sm">HOLIDAY</Badge>
  {:else}
    <Badge variant="outline" class="w-full rounded-sm">UNKNOWN</Badge>
  {/if}
{/snippet}

{#snippet routeBadge(route: RouteWithName | null)}
  {#if route}
    <Badge class="bg-freyza-route w-full rounded-sm">
      {`${route.srcLoc.name.substring(0, 3)} → ${route.destLoc.name.substring(0, 3)}`}</Badge
    >
  {:else}
    <Badge variant="destructive" class="bg-freyza-invalid-route w-full rounded-sm">NO ROUTE</Badge>
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
            hasErrors && "hover:bg-destructive/20",
            // "outline-destructive/50 hover:bg-destructive/20 outline-2 -outline-offset-1",
          ]}
          disabled={outsideMonth}
        >
          <!-- error overlay outline, under probation, change date color looks more nice -->
          {#if hasErrors && false}
            <div
              class="outline-destructive/50 hover:bg-destructive/20 absolute top-2 left-2 h-[calc(100%-var(--spacing)*4)] w-[calc(100%-var(--spacing)*4)] rounded-md outline-2"
            ></div>
          {/if}

          <strong class={["mb-2", hasErrors && "text-destructive"]}>{day.day}</strong>
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
                onValueChange={() => onInput()}
                bind:value={
                  () => thisDayType,
                  (value) => {
                    selectedDayTypes[i] = value
                    if (value !== DayType.WORK) {
                      selectedRoutes[i] = null
                    }
                  }
                }
                {disabled}
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
                {#each planEntries[i].routeId.issues() as issue}
                  <p class="text-destructive ms-2 text-sm">
                    {issue.message}
                  </p>
                {/each}

                <RouteSelectComboBox
                  {routes}
                  bind:value={
                    () => thisRouteId ?? undefined,
                    (value) => {
                      selectedRoutes[i] = value ?? null
                    }
                  }
                  {disabled}
                  onValueChange={() => onInput()}
                />
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
