import { renderSnippet } from "@/lib/components/ui/data-table"
import { DateTime } from "luxon"
import { createRawSnippet } from "svelte"

import type { AppRelease } from "@/lib/types"
import type { ColumnDef } from "@tanstack/table-core"

// Truncate helper snippet
const truncatedCellSnippet = createRawSnippet<[{ text: string; maxWidthClass?: string }]>(
  (getProps) => {
    const { text, maxWidthClass = "max-w-[350px]" } = getProps()
    return {
      render: () => `<div class="${maxWidthClass} truncate" title="${text}">${text}</div>`
    }
  }
)

export const columns: ColumnDef<AppRelease>[] = [
  {
    accessorKey: "versionName",
    header: "Version"
  },
  {
    accessorKey: "buildNumber",
    header: "Build Number"
  },
  {
    accessorKey: "isMandatory",
    header: "Type"
  },
  {
    accessorKey: "releaseNotes",
    header: "Release Notes",
    cell: ({ row }) => {
      return renderSnippet(truncatedCellSnippet, { text: row.original.releaseNotes })
    }
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return row.original.createdAt.toLocaleString(DateTime.TIME_SIMPLE)
    }
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ row }) => {
      return row.original.createdAt.toLocaleString(DateTime.TIME_SIMPLE)
    }
  }
]
