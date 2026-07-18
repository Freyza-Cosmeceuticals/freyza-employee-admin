<script module lang="ts">
import { Badge } from "@ui/badge"

import { getVisitName, getVisitTypeLabel } from "@/lib/helpers"
import { VisitType } from "@/lib/types"

import type { Visit } from "@/lib/types"

export { visitTypeCell, visitNameCell, visitTypeLabelCell }
</script>

{#snippet visitTypeCell({ visitType }: { visitType: VisitType })}
  {#if visitType === VisitType.DOCTOR}
    <Badge variant="secondary" class="rounded-sm">DOCTOR</Badge>
  {:else if visitType === VisitType.CHEMIST}
    <Badge variant="secondary" class="rounded-sm">CHEMIST</Badge>
  {:else if visitType === VisitType.STOCKIST}
    <Badge variant="secondary" class="rounded-sm">STOCKIST</Badge>
  {:else}
    <Badge variant="outline" class="rounded-sm">UNKNOWN</Badge>
  {/if}
{/snippet}

{#snippet visitNameCell({ visit }: { visit: Visit })}
  {getVisitName(visit)}
{/snippet}

{#snippet visitTypeLabelCell({ visitType }: { visitType: VisitType })}
  {getVisitTypeLabel(visitType)}
{/snippet}
