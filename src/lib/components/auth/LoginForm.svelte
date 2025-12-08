<script lang="ts">
import * as Card from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { enhance } from "$app/forms"
import Loader from "@lucide/svelte/icons/loader"
import type { ActionData } from "../../../routes/(unauthenticated)/auth/$types"
import { toast } from "svelte-sonner"

interface Props {
  form: ActionData
}

let { form }: Props = $props()

let loading = $state(false)
</script>

<Card.Root class="w-sm">
  <Card.Header>
    <Card.Title>Admin Login</Card.Title>
    <Card.Description>Login to Freyza Employee Admin</Card.Description>
  </Card.Header>
  <Card.Content>
    <form
      method="POST"
      action="?/login"
      use:enhance={({ formData, cancel }) => {
        loading = true
        const id = toast.loading("Logging in...", {
          description: "Don't worry we will get you there",
          position: "top-center",
          duration: 15000,
        })

        return async ({ result, update }) => {
          if (result.type === "failure") {
            // handle same page failures
            toast.error(String(result.data?.message) ?? "Some error occurred", {
              id,
              position: "top-center",
              description: "",
              duration: undefined,
            })

            loading = false
            await update()
          } else if (result.type === "error") {
            // +error.svelte error
            toast.error("Some unknown error occurred", {
              id,
              position: "top-center",
              description: "Please try again",
              duration: undefined,
            })

            loading = false
            await update()
          } else {
            // it's redirect or success
            toast.loading("Just a little longer...", {
              id,
              position: "top-center",
              description: "",
              duration: 30000,
            })

            loading = false
            await update()

            toast.success("Welcome back!", {
              id,
              position: "top-center",
              description: "",
              duration: undefined,
            })
          }
        }
      }}
    >
      <div class="flex flex-col gap-6">
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            required
            placeholder="email@example.com"
            value={form?.email ?? ""}
            disabled={loading}
          />
        </div>

        <div class="grid gap-2">
          <div class="flex items-center">
            <Label for="password">Password</Label>
            <a
              href="##"
              class="ml-auto inline-block text-sm underline-offset-4 hover:underline"
              tabindex={1}
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="password123"
            disabled={loading}
            required
          />
        </div>
      </div>
      <Button type="submit" class="mt-8 w-full" disabled={loading}>
        {#if loading}
          <Loader class="size-5 animate-spin" />
        {:else}
          Login
        {/if}
      </Button>
    </form>
  </Card.Content>
  <!-- <Card.Footer></Card.Footer> -->
</Card.Root>
