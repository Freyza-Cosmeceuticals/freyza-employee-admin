<script lang="ts">
import * as Sidebar from "@/components/ui/sidebar"
import UserRound from "@lucide/svelte/icons/user-round"
</script>

<Sidebar.Root collapsible="icon">
  <Sidebar.Header>
    <a href="/admin" class="truncate p-2">
      <span class="truncate font-semibold">Freyza Cosmeceuticals</span>
    </a>
  </Sidebar.Header>
  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.GroupLabel>Admin Stuff</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton>
              {#snippet child({ props })}
                <a href="/admin/employees" {...props}>
                  <UserRound />
                  <span>Employees</span>
                </a>
              {/snippet}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton>
              {#snippet child({ props })}
                <a href="##" {...props}>
                  <UserRound />
                  <span>Expenses</span>
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
