import type { LocationWithName } from "@/lib/types"
import type { ColumnDef } from "@tanstack/table-core"

export const columns: ColumnDef<LocationWithName>[] = [
  {
    accessorKey: "name",
    header: "Name"
  }
]
