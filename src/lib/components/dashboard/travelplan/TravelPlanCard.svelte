<script lang="ts">
import * as Avatar from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import * as Card from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { DayType } from "@/generated/prisma/enums"

import { statsBadge } from "./snippets.svelte"
import type { TravelPlanWithEmployee } from "@/types"

interface Props {
  travelPlan: TravelPlanWithEmployee
}

const { travelPlan }: Props = $props()
</script>

<Card.Root class="w-auto p-3">
  <Card.Content class="flex flex-col gap-4 p-0">
    <!-- Header -->
    <div class="flex min-w-0 items-center gap-3">
      <Avatar.Root class="size-8 shrink-0">
        <Avatar.Image src="https://github.com/harshnarayanjha.png" />
        <Avatar.Fallback>
          {travelPlan.employee.name.slice(0, 1)}
        </Avatar.Fallback>
      </Avatar.Root>

      <div class="flex min-w-0 flex-col">
        <span
          class="truncate text-base leading-tight font-semibold"
          title={travelPlan.employee.name}>
          {travelPlan.employee.name}
        </span>

        {#if travelPlan.employee.tier}
          <Badge class="mt-0.5 w-fit px-1.5 py-0 text-xs">
            {travelPlan.employee.tier.toUpperCase()}
          </Badge>
        {/if}
      </div>
    </div>

    <!-- Divider -->
    <Separator />

    <!-- Stats -->
    <div class="flex gap-2">
      {@render statsBadge(DayType.WORK, travelPlan.stats?.workDays ?? 0)}
      {@render statsBadge(DayType.HOLIDAY, travelPlan.stats?.holidayDays ?? 0)}
      {@render statsBadge(DayType.LEAVE, travelPlan.stats?.leaveDays ?? 0)}
    </div>
  </Card.Content>
</Card.Root>
