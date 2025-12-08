<script lang="ts">
import { resolve } from "$app/paths"
import * as Card from "@/components/ui/card"
import CalendarPlusIcon from "@lucide/svelte/icons/calendar-plus"
</script>

<a href={resolve("/admin/travelplan/create")}>
  <Card.Root class="py-4">
    <Card.Content class="grid place-items-center gap-2">
      <CalendarPlusIcon class="bg-secondary size-10 rounded-full p-2" />
      <p class="text-muted-foreground">Add new travel plan</p>
    </Card.Content>
  </Card.Root>
</a>
