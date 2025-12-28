<script lang="ts">
import { goto } from "$app/navigation"
import { resolve } from "$app/paths"
import { Button, buttonVariants } from "@/components/ui/button"
import * as DropdownMenu from "@/components/ui/dropdown-menu"
import UserIcon from "@lucide/svelte/icons/user-round"
import type { Session, SupabaseClient, User } from "@supabase/supabase-js"

interface Props {
  session: Session
  user: User
  supabase: SupabaseClient
}

let { session, user, supabase }: Props = $props()

const logout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error(error)
  }

  goto(resolve("/"))
}
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <span class={buttonVariants({ variant: "outline", size: "sm" })}><UserIcon /></span>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Group>
      <DropdownMenu.Label>Account</DropdownMenu.Label>
      <DropdownMenu.Separator />
      <DropdownMenu.Item>{user.email}</DropdownMenu.Item>
      <DropdownMenu.Item>Profile</DropdownMenu.Item>
      <DropdownMenu.Item>
        <Button onclick={logout} class="w-full">Logout</Button>
      </DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
