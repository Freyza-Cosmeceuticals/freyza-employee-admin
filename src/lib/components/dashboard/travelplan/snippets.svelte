<script module lang="ts">
import { Badge } from "@/components/ui/badge"
import { DayType } from "@/generated/prisma/enums"
import type { RouteWithName } from "@/types"

export { dayTypeBadge, routeBadge }
</script>

{#snippet dayTypeBadge(dt: DayType)}
  {#if dt == DayType.WORK}
    <Badge variant="default" class="w-min rounded-sm">WORK</Badge>
  {:else if dt == DayType.LEAVE}
    <Badge class="bg-freyza-badge-leave w-min rounded-sm">LEAVE</Badge>
  {:else if dt == DayType.HOLIDAY}
    <Badge class="bg-freyza-badge-holiday w-min rounded-sm">HOLIDAY</Badge>
  {:else}
    <Badge variant="outline" class="w-min rounded-sm">UNKNOWN</Badge>
  {/if}
{/snippet}

{#snippet routeBadge(route: RouteWithName | null)}
  {#if route}
    <Badge class="bg-freyza-route w-full rounded-sm">
      {`${route.srcLoc.name.substring(0, 3)} → ${route.destLoc.name.substring(0, 3)}`}
    </Badge>
  {:else}
    <Badge variant="destructive" class="bg-freyza-invalid-route w-full rounded-sm">NO ROUTE</Badge>
  {/if}
{/snippet}
