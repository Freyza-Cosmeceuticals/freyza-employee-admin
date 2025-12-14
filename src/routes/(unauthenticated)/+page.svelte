<script lang="ts">
import { resolve } from "$app/paths"
import { buttonVariants } from "@/components/ui/button"

let { data } = $props()
let { session } = $derived(data)
</script>

<svelte:head>
  <title>Freyza Cosmeceuticals Employee System</title>
  <meta name="description" content="Freyza Cosmeceuticals Employee System" />
</svelte:head>

<div
  class="mx-auto grid h-[80svh] w-full max-w-2xl grid-cols-1 place-content-center gap-8 text-center"
>
  <h1 class="text-3xl font-bold">Freyza Cosmeceuticals Employee System</h1>

  {#if session !== null}
    <a href={resolve("/admin")} class={buttonVariants({ variant: "default", size: "lg" })}>
      <span class="font-semibold"> Goto Admin Dashboard </span>
    </a>
  {:else}
    <a
      href="/auth"
      class={buttonVariants({
        variant: "default",
        size: "lg",
        class: "bg-freyza-brand-primary",
      })}
    >
      <span class="font-semibold"> Admin Login </span>
    </a>
    <a
      href="/"
      class={buttonVariants({
        variant: "secondary",
        size: "sm",
        class: "bg-freyza-brand-tertiary",
      })}
    >
      <span>Download Freyza Employee App</span>
    </a>
  {/if}
</div>
