import { renderComponent, renderSnippet } from "@ui/data-table"

import { employeeStatus, employeeTier } from "@/lib/components/dashboard/employee/snippets.svelte"
import { DateTime } from "luxon"

import DataTableActions from "./data-table-actions.svelte"
import type { EmployeeWithHQ } from "@/lib/types"
import type { ColumnDef } from "@tanstack/table-core"

export const columns: ColumnDef<EmployeeWithHQ>[] = [
  // {
  //   accessorKey: "id",
  //   header: "ID",
  // },
  {
    accessorKey: "name",
    header: "Name"
  },
  {
    accessorKey: "email",
    header: "Email"
  },
  {
    accessorKey: "phone",
    header: "Phone"
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return renderSnippet(employeeStatus, { status: row.original.status })
    }
  },
  {
    accessorKey: "tier",
    header: "Tier",
    cell: ({ row }) => {
      return renderSnippet(employeeTier, { tier: row.original.tier })
    }
  },
  {
    accessorKey: "hq.name",
    header: "Headquarters"
  },
  {
    accessorKey: "joiningDate",
    header: "Joining Date",
    cell: ({ row }) => {
      return DateTime.fromJSDate(row.original.joiningDate).toLocaleString(DateTime.DATE_MED)
    }
  },
  {
    accessorKey: "resignDate",
    header: "Resign Date",
    cell: ({ row }) => {
      return row.original.resignDate
        ? DateTime.fromJSDate(row.original.resignDate).toLocaleString(DateTime.DATE_MED)
        : "N/A"
    }
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => renderComponent(DataTableActions, { id: row.original.id })
  }
]
