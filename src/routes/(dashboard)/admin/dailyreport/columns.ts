import { resolve } from "$app/paths"

import { renderSnippet } from "@ui/data-table"

import { buttonVariants } from "@/lib/components/ui/button"
import { formatRouteName } from "@/lib/helpers"
import { DayType } from "@/lib/types"
import { DateTime } from "luxon"
import { createRawSnippet } from "svelte"

import { actionCell, dayTypeCell, statusCell } from "./snippets.svelte"
import type { DailyReportFull, EmployeeWithHQ, RouteWithName } from "@/lib/types"
import type { ColumnDef } from "@tanstack/table-core"

const employeeLinkSnippet = createRawSnippet<[{ employee: EmployeeWithHQ }]>((getEmployee) => {
  const emp = getEmployee()
  return {
    render: () =>
      // TOOD: Once employee detail route is done
      `<a class="${buttonVariants({ variant: "link", className: "text-foreground" })}" href="${resolve(`/admin/employees`)}">${emp.employee.name}</a>`
  }
})

export const columns: ColumnDef<DailyReportFull>[] = [
  // {
  //   accessorKey: "id",
  //   header: "ID"
  // },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      return DateTime.fromJSDate(row.original.date).toLocaleString(DateTime.DATE_MED)
    }
  },
  {
    accessorKey: "employee",
    header: "Employee",
    id: "employee",
    cell: ({ row }) => {
      return renderSnippet(employeeLinkSnippet, {
        employee: row.original.employee as EmployeeWithHQ
      })
    }
  },
  {
    accessorKey: "dayType",
    header: "Day Type",
    cell: ({ row }) => {
      return renderSnippet(dayTypeCell, { dayType: row.original.dayType })
    }
  },
  {
    header: "Route",
    cell: ({ row }) => {
      return row.original.route ? formatRouteName(row.original.route as RouteWithName) : "N/A"
    }
  },
  {
    header: "Travelling With",
    cell: ({ row }) => {
      if (row.original.dayType != DayType.WORK) return "N/A"

      return row.original.travellingWith
        ? renderSnippet(employeeLinkSnippet, {
            employee: row.original.travellingWith as EmployeeWithHQ
          })
        : "—"
    }
  },
  {
    accessorKey: "numVisits",
    header: "Visits Made",
    cell: ({ row }) => {
      if (row.original.route) return `${row.original.numVisits ?? "—"}`
      return "N/A"
    }
  },
  {
    accessorKey: "ta",
    header: "TA",
    cell: ({ row }) => {
      return row.original.ta
        ? `${Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.original.ta)}`
        : "N/A"
    }
  },
  {
    accessorKey: "da",
    header: "DA",
    cell: ({ row }) => {
      return row.original.da
        ? `${Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.original.da)}`
        : "N/A"
    }
  },
  {
    accessorKey: "totalExpense",
    header: "Total Expense",
    cell: ({ row }) => {
      return row.original.totalExpense
        ? `${Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(row.original.totalExpense)}`
        : "N/A"
    }
  },
  {
    accessorKey: "locked",
    header: "Status",
    cell: ({ row }) => {
      return renderSnippet(statusCell, { locked: row.original.locked })
    }
  },
  {
    accessorKey: "lockedAt",
    header: "Locked At",
    cell: ({ row }) => {
      if (!row.original.locked || !row.original.lockedAt) return "N/A"

      const lockedAt = row.original.lockedAt
      const date = DateTime.fromJSDate(row.original.date)
      if (lockedAt.day === date.day) return lockedAt.toLocaleString(DateTime.TIME_SIMPLE)

      return lockedAt.toLocaleString(DateTime.DATETIME_MED)
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
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return renderSnippet(actionCell, { reportId: row.original.id })
    }
  }
]
