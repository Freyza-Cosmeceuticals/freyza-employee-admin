import { renderSnippet } from "@ui/data-table"

import { VisitType } from "@/lib/constants"
import { DateTime } from "luxon"
import { createRawSnippet } from "svelte"

import type { POIWithDetails } from "@/lib/types"
import type { ColumnDef } from "@tanstack/table-core"

const formatCurrency = (amount: number) => {
  return Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount)
}

const nameCellSnippet = createRawSnippet<[{ poi: POIWithDetails }]>((getProps) => {
  const { poi } = getProps()
  let subtitle = ""
  if (poi.type === VisitType.DOCTOR && poi.doctor) {
    const parts = [poi.doctor.specialty, poi.doctor.clinicName].filter(Boolean)
    if (parts.length > 0) subtitle = parts.join(" • ")
  } else if (poi.type === VisitType.STOCKIST && poi.stockist?.gstNumber) {
    subtitle = `GSTIN: ${poi.stockist.gstNumber}`
  }

  return {
    render: () => `
      <div class="flex flex-col">
        <span class="font-medium text-foreground">${poi.name}</span>
        ${subtitle ? `<span class="text-xs text-muted-foreground">${subtitle}</span>` : ""}
      </div>
    `
  }
})

const typeBadgeSnippet = createRawSnippet<[{ type: VisitType }]>((getProps) => {
  const { type } = getProps()
  return {
    render: () => `
      <span class="inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground uppercase">
        ${type}
      </span>
    `
  }
})

export const columns: ColumnDef<POIWithDetails>[] = [
  {
    accessorKey: "name",
    header: "Name",
    id: "name",
    cell: ({ row }) => {
      return renderSnippet(nameCellSnippet, { poi: row.original })
    }
  },
  {
    accessorKey: "type",
    header: "Type",
    id: "type",
    cell: ({ row }) => {
      return renderSnippet(typeBadgeSnippet, { type: row.original.type })
    }
  },
  {
    accessorKey: "location.name",
    header: "Location",
    id: "location"
  },
  {
    accessorKey: "numVisits",
    header: "Visits",
    id: "visits",
    cell: ({ row }) => {
      return `${row.original.numVisits}`
    }
  },
  {
    accessorKey: "totalSales",
    header: "Total Sales",
    id: "sales",
    cell: ({ row }) => {
      return row.original.totalSales > 0 ? formatCurrency(row.original.totalSales) : "—"
    }
  },
  {
    accessorKey: "totalCollections",
    header: "Collections",
    id: "collections",
    cell: ({ row }) => {
      return row.original.totalCollections > 0 ? formatCurrency(row.original.totalCollections) : "—"
    }
  },
  {
    accessorKey: "outstandingAmount",
    header: "Outstanding",
    id: "outstanding",
    cell: ({ row }) => {
      return row.original.outstandingAmount > 0
        ? formatCurrency(row.original.outstandingAmount)
        : "—"
    }
  },
  {
    accessorKey: "lastVisitedDate",
    header: "Last Visited",
    id: "lastVisited",
    cell: ({ row }) => {
      if (!row.original.lastVisitedDate) return "Never"
      return DateTime.fromJSDate(row.original.lastVisitedDate).toLocaleString(DateTime.DATE_MED)
    }
  },
  {
    header: "Coordinates",
    id: "coordinates",
    cell: ({ row }) => {
      const { latitude, longitude } = row.original
      if (latitude && longitude) {
        return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      }
      return "—"
    }
  }
]
