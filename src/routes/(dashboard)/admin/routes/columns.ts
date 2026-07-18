import type { RouteWithName } from "@/lib/types"
import type { ColumnDef } from "@tanstack/table-core"

export const columns: ColumnDef<RouteWithName>[] = [
  {
    accessorKey: "srcLoc.name",
    header: "From",
    id: "from"
  },
  {
    accessorKey: "destLoc.name",
    header: "To",
    id: "to"
  },
  {
    accessorKey: "distanceKm",
    header: "Distance (km)",
    id: "distance"
  }
]
