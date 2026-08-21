import type { AppRelease } from "@/lib/types"
import type { ColumnDef } from "@tanstack/table-core"

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
    cell: (info) => info.getValue()
  }
]
