<script lang="ts">
import { enhance } from "$app/forms"

import { Button } from "@ui/button"
import * as Card from "@ui/card"
import { Input } from "@ui/input"
import { Label } from "@ui/label"

import Loader from "@lucide/svelte/icons/loader"
import { toast } from "svelte-sonner"

import type { ActionData } from "../../../routes/(unauthenticated)/auth/$types"

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
      use:enhance={() => {
        loading = true
        const id = toast.loading("Logging in...", {
          description: "Please wait while we authenticate your credentials",
          position: "top-center",
          duration: 15000
        })

        return async ({ result, update }) => {
          if (result.type === "failure") {
            // handle same page failures
            toast.error(String(result.data?.message) ?? "An error occurred during login", {
              id,
              position: "top-center",
              description: "",
              duration: undefined
            })

            loading = false
            await update()
          } else if (result.type === "error") {
            // +error.svelte error
            toast.error("An unexpected error occurred", {
              id,
              position: "top-center",
              description: "Please try again or contact support",
              duration: undefined
            })

            loading = false
            await update()
          } else {
            // it's redirect or success
            toast.loading("Completing authentication...", {
              id,
              position: "top-center",
              description: "",
              duration: 30000
            })

            loading = false
            await update()

            toast.success("Welcome back", {
              id,
              position: "top-center",
              description: "",
              duration: undefined
            })
          }
        }
      }}>
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
            disabled={loading} />
        </div>

        <div class="grid gap-2">
          <div class="flex items-center">
            <Label for="password">Password</Label>
            <a
              href="##"
              class="ml-auto inline-block text-sm underline-offset-4 hover:underline"
              tabindex={1}>
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="password123"
            disabled={loading}
            required />
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
