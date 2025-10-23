<script lang="ts">
import { buttonVariants } from "@/components/ui/button"
</script>

<svelte:head>
  <title>Freyza Cosmeceuticals Employee System</title>
  <meta name="description" content="Freyza Cosmeceuticals Employee System" />
</svelte:head>

<div
  class="mx-auto grid h-[80svh] w-full max-w-2xl grid-cols-1 place-content-center gap-8 text-center"
>
  <h1 class="text-3xl font-bold">Freyza Cosmeceuticals Employee System</h1>

  <a href="/auth" class={buttonVariants({ variant: "default", size: "lg" })}>
    <span class="font-bold"> Admin Login </span>
  </a>
  <a href="/" class={buttonVariants({ variant: "secondary", size: "sm" })}>
    <button>Download Freyza Employee App</button>
  </a>
</div>
