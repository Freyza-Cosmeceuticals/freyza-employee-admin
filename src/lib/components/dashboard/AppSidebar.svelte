<script lang="ts">
import { resolve } from "$app/paths"

import * as Sidebar from "@ui/sidebar"

import CalendarDaysIcon from "@lucide/svelte/icons/calendar-days"
import CalendarPlusIcon from "@lucide/svelte/icons/calendar-plus"
import MapPinIcon from "@lucide/svelte/icons/map-pin"
import NotebookTabsIcon from "@lucide/svelte/icons/notebook-tabs"
import RouteIcon from "@lucide/svelte/icons/route"
import UserRoundIcon from "@lucide/svelte/icons/user-round"
</script>

<Sidebar.Root collapsible="icon">
  <Sidebar.Header>
    <a href={resolve("/admin")} class="truncate p-2">
      <span class="truncate font-semibold">Freyza Cosmeceuticals</span>
    </a>
  </Sidebar.Header>
  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.GroupLabel>Admin</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton>
              {#snippet child({ props })}
                <a href={resolve("/admin/employees")} {...props}>
                  <UserRoundIcon />
                  <span>Employees</span>
                </a>
              {/snippet}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton>
              {#snippet child({ props })}
                <a href={resolve("/admin/dailyreport")} {...props}>
                  <NotebookTabsIcon />
                  <span>Daily Reports</span>
                </a>
              {/snippet}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>

    <Sidebar.Group>
      <Sidebar.GroupLabel>Plan</Sidebar.GroupLabel>
      <Sidebar.GroupAction>
        {#snippet child({ props })}
          <a href={resolve("/admin/travelplan/create")} {...props}>
            <CalendarPlusIcon />
          </a>
        {/snippet}
      </Sidebar.GroupAction>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton>
              {#snippet child({ props })}
                <a href={resolve("/admin/travelplan")} {...props}>
                  <CalendarDaysIcon />
                  <span>Travel Plans</span>
                </a>
              {/snippet}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>

    <Sidebar.Group>
      <Sidebar.GroupLabel>Manage</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton>
              {#snippet child({ props })}
                <a href="##" {...props}>
                  <MapPinIcon />
                  <span>Locations</span>
                </a>
              {/snippet}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton>
              {#snippet child({ props })}
                <a href="##" {...props}>
                  <RouteIcon />
                  <span>Routes</span>
                </a>
              {/snippet}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>
  <Sidebar.Footer></Sidebar.Footer>
  <Sidebar.Rail />
</Sidebar.Root>
