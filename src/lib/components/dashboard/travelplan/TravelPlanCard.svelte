<script lang="ts">
import * as ButtonGroup from "$lib/components/ui/button-group"
import * as Avatar from "@/components/ui/avatar"
import * as Card from "@/components/ui/card"
import { DayType } from "@/generated/prisma/enums"
import type { TravelPlanWithEmployee } from "@/types"
import { dayTypeBadge } from "./snippets.svelte"
import { Badge } from "@/components/ui/badge"

interface Props {
  travelPlan: TravelPlanWithEmployee
}

const { travelPlan }: Props = $props()
</script>

<Card.Root class="h-auto w-72 p-2">
  <Card.Content class="flex h-full flex-row items-center justify-between p-2">
    <div class="flex flex-col items-end gap-2">
      <ButtonGroup.Root>
        {@render dayTypeBadge(DayType.WORK)}
        <ButtonGroup.Text>
          <span class="font-mono font-medium"
            >{travelPlan.stats.workDays.toString().padStart(2, "0")}</span
          >
        </ButtonGroup.Text>
      </ButtonGroup.Root>
      <ButtonGroup.Root>
        {@render dayTypeBadge(DayType.HOLIDAY)}
        <ButtonGroup.Text>
          <span class="font-mono font-medium"
            >{travelPlan.stats.holidayDays.toString().padStart(2, "0")}</span
          >
        </ButtonGroup.Text>
      </ButtonGroup.Root>
      <ButtonGroup.Root>
        {@render dayTypeBadge(DayType.LEAVE)}
        <ButtonGroup.Text>
          <span class="font-mono font-medium"
            >{travelPlan.stats.leaveDays.toString().padStart(2, "0")}</span
          >
        </ButtonGroup.Text>
      </ButtonGroup.Root>
    </div>
    <ButtonGroup.Separator />
    <div class="flex flex-col items-center justify-center gap-2">
      <div class="flex flex-row items-center gap-2">
        <Avatar.Root class="size-6">
          <Avatar.Image src="https://github.com/harshnarayanjha.png" />
          <Avatar.Fallback>{travelPlan.employee.name.substring(0, 1)}</Avatar.Fallback>
        </Avatar.Root>
        <div class="text-lg font-semibold">{travelPlan.employee.name}</div>
      </div>
      <Badge>{travelPlan.employee.tier?.toUpperCase()}</Badge>
    </div>
  </Card.Content>
</Card.Root>
