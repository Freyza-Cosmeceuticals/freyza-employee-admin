<script lang="ts">
import * as ButtonGroup from "$lib/components/ui/button-group"
import * as Avatar from "@/components/ui/avatar"
import * as Card from "@/components/ui/card"
import { DayType } from "@/generated/prisma/enums"
import type { TravelPlanWithEmployee } from "@/types"
import { dayTypeBadge } from "./snippets.svelte"

interface Props {
  travelPlan: TravelPlanWithEmployee
}

const { travelPlan }: Props = $props()
</script>

<Card.Root class="h-auto w-64 p-4">
  <Card.Content class="flex flex-row justify-between p-2">
    <div class="flex flex-col gap-2">
      <ButtonGroup.Root>
        <ButtonGroup.Text>
          <span class="text-sm font-semibold">{travelPlan.workDays || 19}</span>
        </ButtonGroup.Text>
        {@render dayTypeBadge(DayType.WORK)}
      </ButtonGroup.Root>
      <ButtonGroup.Root>
        {@render dayTypeBadge(DayType.LEAVE)}
        <ButtonGroup.Text>
          <span class="text-sm font-semibold">{travelPlan.leaveDays || 3}</span>
        </ButtonGroup.Text>
      </ButtonGroup.Root>
      <ButtonGroup.Root>
        <ButtonGroup.Text>
          <span class="text-sm font-semibold">{travelPlan.holidayDays || 9}</span>
        </ButtonGroup.Text>
        {@render dayTypeBadge(DayType.HOLIDAY)}
      </ButtonGroup.Root>
    </div>
    <div class="flex flex-col items-center justify-center gap-2">
      <Avatar.Root class="size-10">
        <Avatar.Image src="https://github.com/harshnarayanjha.png" />
        <Avatar.Fallback>{travelPlan.employee.name.substring(0, 1)}</Avatar.Fallback>
      </Avatar.Root>
      <div class="text-lg font-semibold">{travelPlan.employee.name}</div>
    </div>
  </Card.Content>
</Card.Root>
