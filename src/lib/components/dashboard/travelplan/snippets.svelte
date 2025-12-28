<script module lang="ts">
import { Badge } from "@/components/ui/badge"
import { DayType } from "@/generated/prisma/enums"
import type { RouteWithName } from "@/types"

export { dayTypeBadge, routeBadge }
</script>

{#snippet dayTypeBadge(dt: DayType)}
  {#if dt == DayType.WORK}
    <Badge variant="default" class="rounded-sm">WORK</Badge>
  {:else if dt == DayType.LEAVE}
    <Badge class="rounded-sm bg-freyza-badge-leave">LEAVE</Badge>
  {:else if dt == DayType.HOLIDAY}
    <Badge class="rounded-sm bg-freyza-badge-holiday">HOLIDAY</Badge>
  {:else}
    <Badge variant="outline" class="rounded-sm">UNKNOWN</Badge>
  {/if}
{/snippet}

{#snippet routeBadge(route: RouteWithName | null)}
  {#if route}
    <Badge class="w-full rounded-sm bg-freyza-route">
      {`${route.srcLoc.name.substring(0, 3)} → ${route.destLoc.name.substring(0, 3)}`}
    </Badge>
  {:else}
    <Badge variant="destructive" class="w-full rounded-sm bg-freyza-invalid-route">NO ROUTE</Badge>
  {/if}
{/snippet}
