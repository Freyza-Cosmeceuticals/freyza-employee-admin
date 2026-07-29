<script lang="ts">
import { Badge } from "@ui/badge"
import * as Card from "@ui/card"

import { VisitType } from "$lib/types"

import { getVisitName, getVisitTypeLabel } from "@/lib/helpers"
import { DateTime } from "luxon"

import type { Visit } from "$lib/types"
import type { ClassValue } from "svelte/elements"

interface Props {
  visit: Visit
  class?: ClassValue
}

let { visit, class: className }: Props = $props()

const visitTypeLabel = $derived(getVisitTypeLabel(visit.visitType))
const visitName = $derived(getVisitName(visit))
</script>

<Card.Root class={["w-full", className]}>
  <Card.Header>
    <div class="flex items-start justify-between">
      <div class="flex-1 space-y-2">
        <div class="flex items-center gap-2">
          <Card.Title class="text-lg">{visitName}</Card.Title>
          <Badge variant="secondary">{visitTypeLabel}</Badge>
        </div>
        <p class="text-sm text-muted-foreground">
          {visit.latitude.toFixed(4)}, {visit.longitude.toFixed(4)} - {visit.distanceMetersFromPOI}m
          away - Created {visit.createdAt.toLocaleString(DateTime.TIME_SIMPLE)}
          {#if visit.updatedAt && visit.updatedAt !== visit.createdAt}
            - Updated {visit.updatedAt.toLocaleString(DateTime.TIME_SIMPLE)}
          {/if}
        </p>
      </div>
    </div>
  </Card.Header>

  <Card.Content class="space-y-4">
    <!-- Products Section -->
    {#if visit.productDetails.length > 0}
      <div class="space-y-2">
        <p class="text-sm font-medium">Products Shown</p>
        {#each visit.productDetails as product (product.name)}
          <div class="flex flex-row items-center gap-2">
            <p class="line-clamp-1 w-32 text-sm text-ellipsis text-muted-foreground">
              {product.name}
            </p>
            <p class="min-w-16 text-sm">{product.rate}</p>
            <p class="w-2 text-sm text-muted-foreground select-none">x</p>
            <p class="min-w-8 text-sm">{product.quantity}</p>
            <p class="w-2 text-sm text-muted-foreground select-none">=</p>
            <p class="min-w-16 text-sm">{(product.rate * product.quantity).toFixed(2)}</p>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Samples Section -->
    {#if visit.samplesGiven.length > 0}
      <div class="space-y-2">
        <p class="text-sm font-medium">Samples Given</p>
        <div class="flex flex-wrap gap-1">
          {#each visit.samplesGiven as sample}
            <Badge variant="outline">{sample}</Badge>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Visit Type Specific Fields -->
    <div class="space-y-2 border-t pt-4">
      {#if visit.visitType === VisitType.STOCKIST}
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p class="font-medium">Stock Checked</p>
            <p class="text-muted-foreground">{visit.stockChecked ? "Yes" : "No"}</p>
          </div>
        </div>
      {/if}

      <div class="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p class="font-medium">Order Taken</p>
          <p class="text-muted-foreground">{visit.orderTaken ? "Yes" : "No"}</p>
        </div>
        <div>
          <p class="font-medium">Payment Collected</p>
          <p class="text-muted-foreground">{visit.paymentCollected ? "Yes" : "No"}</p>
        </div>
      </div>

      {#if visit.paymentCollected && (visit.amountWithGST || visit.amountWithoutGST)}
        <div class="grid grid-cols-2 gap-2 text-sm">
          {#if visit.amountWithGST}
            <div>
              <p class="font-medium">Amount (with GST)</p>
              <p class="text-muted-foreground">₹{visit.amountWithGST}</p>
            </div>
          {/if}
          {#if visit.amountWithoutGST}
            <div>
              <p class="font-medium">Amount (without GST)</p>
              <p class="text-muted-foreground">₹{visit.amountWithoutGST}</p>
            </div>
          {/if}
        </div>
      {/if}

      {#if visit.outstandingAmount}
        <div class="text-sm">
          <p class="font-medium">Outstanding Amount</p>
          <p class="text-muted-foreground">₹{visit.outstandingAmount}</p>
        </div>
      {/if}

      {#if visit.orderAmount}
        <div class="text-sm">
          <p class="font-medium">Order Amount</p>
          <p class="text-muted-foreground">₹{visit.orderAmount}</p>
        </div>
      {/if}
    </div>

    <!-- Additional Notes -->
    {#if visit.additionalNotes}
      <div class="space-y-2 border-t pt-4">
        <p class="text-sm font-medium">Notes</p>
        <p class="text-sm text-muted-foreground">{visit.additionalNotes}</p>
      </div>
    {/if}
  </Card.Content>
</Card.Root>
