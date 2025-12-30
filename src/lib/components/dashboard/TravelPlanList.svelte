<script lang="ts">
import * as Empty from "@/components/ui/empty"
import * as Item from "@/components/ui/item"

import { DayType } from "@db/browser"

import CalendarIcon from "@lucide/svelte/icons/calendars"

import { dayTypeBadge } from "./travelplan/snippets.svelte"
import TravelPlanCard from "./travelplan/TravelPlanCard.svelte"
import type { ItemVariant } from "@/components/ui/item/item.svelte"
import type { TravelPlanWithEmployee } from "@/types"

interface Props {
  variant?: ItemVariant
  plans: TravelPlanWithEmployee[]
}

let { variant = "default", plans }: Props = $props()
</script>

{#snippet planStats(plan: TravelPlanWithEmployee)}
  <div>
    {@render dayTypeBadge(DayType.WORK)}
    {plan.stats.workDays}
  </div>
{/snippet}

<!-- Wrapped in Card.Content -->
<Item.Group>
  {#each plans as plan, i (plan.id)}
    <Item.Root {variant}>
      <Item.Content>
        <TravelPlanCard travelPlan={plan} />
      </Item.Content>
    </Item.Root>
    {#if i !== plans.length - 1}
      <Item.Separator />
    {/if}
  {:else}
    <Empty.Root>
      <Empty.Header>
        <Empty.Media variant="icon">
          <CalendarIcon />
        </Empty.Media>
        <Empty.Title>0 Travel Plans</Empty.Title>
        <Empty.Description>You have no travel plans yet.</Empty.Description>
      </Empty.Header>
    </Empty.Root>
  {/each}
</Item.Group>
