<script lang="ts">
import { resolve } from "$app/paths"

import * as Card from "@ui/card"

import CalendarPlusIcon from "@lucide/svelte/icons/calendar-plus"

import type { DateTime } from "luxon"

interface Props {
  month: DateTime
}

let props: Props = $props()
</script>

<a
  href={resolve(`/admin/travelplan/create?month=${props.month.toISODate({ precision: "month" })}`)}>
  <Card.Root class="h-full w-64 cursor-pointer p-4">
    <Card.Content class="grid place-items-center gap-2 p-2">
      <CalendarPlusIcon class="size-10 rounded-full bg-secondary p-2" />
      <p class="text-muted-foreground">Add new travel plan</p>
    </Card.Content>
  </Card.Root>
</a>
