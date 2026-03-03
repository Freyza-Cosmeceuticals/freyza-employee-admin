<script lang="ts">
import { resolve } from "$app/paths"

import * as Avatar from "@ui/avatar"
import { Badge } from "@ui/badge"
import * as Card from "@ui/card"
import { Separator } from "@ui/separator"

import type { DailyReportWithEmployee } from "$lib/types"

interface Props {
  dailyReport: DailyReportWithEmployee
}

const { dailyReport }: Props = $props()

let dailyReportUrl = $derived.by(() => {
  // skip sidebar based for now
  // const dt = DateTime.fromJSDate(dailyReport.date, { zone: TIMEZONE }) as DateTime<true>
  return resolve(`/admin/dailyreport/${dailyReport.id}`)
})
</script>

<Card.Root class="w-auto p-3">
  <Card.Content class="flex flex-col gap-4 p-1">
    <!-- Header -->
    <div class="flex w-full flex-row items-center justify-start gap-3">
      <Avatar.Root class="size-8 shrink-0">
        <Avatar.Image src="https://github.com/harshnarayanjha.png" />
        <Avatar.Fallback>
          {dailyReport.employee.name.slice(0, 1)}
        </Avatar.Fallback>
      </Avatar.Root>

      <div class="flex min-w-0 flex-col">
        <span
          class="truncate text-base leading-tight font-semibold"
          title={dailyReport.employee.name}>
          {dailyReport.employee.name}
        </span>

        <div class="flex flex-row items-center gap-2">
          {#if dailyReport.employee.tier}
            <Badge class="mt-0.5 w-fit px-1.5 py-0 text-xs">
              {dailyReport.employee.tier.toUpperCase()}
            </Badge>
          {/if}

          {#if dailyReport.employee.hq}
            <span class="text-sm text-muted-foreground italic">
              {dailyReport.employee.hq.name}
            </span>
          {/if}
        </div>
      </div>

      <a href={dailyReportUrl} class="ms-auto self-start text-sm hover:underline"> View Report </a>
    </div>
    <Separator />
  </Card.Content>
  <Card.Footer>
    <!-- Stats -->
    TODO: Stats
  </Card.Footer>
</Card.Root>
