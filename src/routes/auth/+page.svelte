<script lang="ts">
import LoginForm from "@/components/auth/LoginForm.svelte"
import CircleAlertIcon from "@lucide/svelte/icons/circle-alert"
import * as Alert from "@/components/ui/alert"

let { form } = $props()
</script>

<svelte:head>
  <title>Admin Login | Freyza Cosmeceuticals Employee System</title>
  <meta name="description" content="Admin Login page for Freyza Cosmeceuticals Employee System" />
</svelte:head>

<div class="grid h-[80svh] w-full place-content-center gap-4">
  {#if form?.error}
    <Alert.Root variant="destructive">
      <CircleAlertIcon class="size-4" />
      <Alert.AlertTitle>Error</Alert.AlertTitle>
      <Alert.AlertDescription>{form?.message}</Alert.AlertDescription>
    </Alert.Root>
  {/if}

  <!-- has a ?/login form action -->
  <LoginForm {form} />
</div>
