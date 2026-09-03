import { renderComponent, renderSnippet } from "@ui/data-table"

import { DateTime } from "luxon"

import type { VisitFull } from "@/lib/types"
import type { ColumnDef } from "@tanstack/table-core"
import DataTableActions from "./data-table-actions.svelte"
import { visitNameCell, visitTypeCell } from "./snippets.svelte"

export const columns: ColumnDef<VisitFull>[] = [
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
    id: "products",
    header: "Products",
    cell: ({ row }) => {
      return row.original.productDetails.length > 0 ? row.original.productDetails.length : "—"
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
    accessorKey: "orderAmount",
    header: "Order Amount",
    cell: ({ row }) => {
      const amt = row.original.orderAmount ? parseFloat(row.original.orderAmount) : 0
      return amt > 0
        ? Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amt)
        : "—"
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
    accessorKey: "amountWithoutGST",
    header: "Collected (w/o GST)",
    cell: ({ row }) => {
      const amt = row.original.amountWithoutGST ? parseFloat(row.original.amountWithoutGST) : 0
      return amt > 0
        ? Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amt)
        : "—"
    }
  },
  {
    accessorKey: "outstandingAmount",
    header: "Outstanding",
    cell: ({ row }) => {
      return row.original.outstandingAmount
        ? Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
            parseFloat(row.original.outstandingAmount)
          )
        : "—"
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
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      return row.original.createdAt.toLocaleString(DateTime.TIME_SIMPLE)
    }
  },
  {
    accessorKey: "updatedAt",
    header: "Last Updated",
    cell: ({ row }) => {
      if (!row.original.updatedAt) return "—"
      return row.original.updatedAt.toLocaleString(DateTime.TIME_SIMPLE)
    }
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) =>
      renderComponent(DataTableActions, { reportId: row.original.reportId, id: row.original.id })
  }
]
