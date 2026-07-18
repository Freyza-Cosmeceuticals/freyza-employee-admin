import { renderComponent, renderSnippet } from "@ui/data-table"

import DataTableActions from "./data-table-actions.svelte"
import { visitNameCell, visitTypeCell } from "./snippets.svelte"
import type { Visit } from "@/lib/types"
import type { ColumnDef } from "@tanstack/table-core"

export const columns: ColumnDef<Visit>[] = [
  {
    accessorKey: "visitType",
    header: "Type",
    cell: ({ row }) => {
      return renderSnippet(visitTypeCell, { visitType: row.original.visitType })
    }
  },
  {
    id: "name",
    header: "Name",
    cell: ({ row }) => {
      return renderSnippet(visitNameCell, { visit: row.original })
    }
  },
  {
    id: "location",
    header: "Location (Coords)",
    cell: ({ row }) => {
      return `${row.original.latitude.toFixed(4)}, ${row.original.longitude.toFixed(4)}`
    }
  },
  {
    accessorKey: "distanceMetersFromPOI",
    header: "Distance (m)"
  },
  {
    id: "samples",
    header: "Samples",
    cell: ({ row }) => {
      if (row.original.samplesGiven.length === 0) return "—"
      return row.original.samplesGiven.length
    }
  },
  {
    accessorKey: "orderTaken",
    header: "Order Taken",
    cell: ({ row }) => {
      return row.original.orderTaken ? "Yes" : "No"
    }
  },
  {
    id: "products",
    header: "Products",
    cell: ({ row }) => {
      if (row.original.productDetails.length === 0) return "0"

      return `${row.original.productDetails.length} (total ${
        row.original.orderAmount
          ? Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
              parseFloat(row.original.orderAmount)
            )
          : "—"
      })`
    }
  },
  {
    accessorKey: "paymentCollected",
    header: "Payment Collected",
    cell: ({ row }) => {
      return row.original.paymentCollected ? "Yes" : "No"
    }
  },
  {
    accessorKey: "stockChecked",
    header: "Stock Checked",
    cell: ({ row }) => {
      return row.original.stockChecked ? "Yes" : "No"
    }
  },
  {
    accessorKey: "outstandingAmount",
    header: "Outstanding Amount",
    cell: ({ row }) => {
      return row.original.outstandingAmount
        ? Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
            parseFloat(row.original.outstandingAmount)
          )
        : "—"
    }
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) =>
      renderComponent(DataTableActions, { reportId: row.original.reportId, id: row.original.id })
  }
]
