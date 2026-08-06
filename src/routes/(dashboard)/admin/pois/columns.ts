import type { POIWithLocation } from "@/lib/types"
import type { ColumnDef } from "@tanstack/table-core"

export const columns: ColumnDef<POIWithLocation>[] = [
  {
    accessorKey: "name",
    header: "Name",
    id: "name"
  },
  {
    accessorKey: "type",
    header: "Type",
    id: "type"
  },
  {
    accessorKey: "location.name",
    header: "Location",
    id: "location"
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
