<script>
import { buttonVariants } from "../ui/button"
import ColorModeToggle from "./ColorModeToggle.svelte"
</script>

<!-- Frontpage Navbar -->
<header>
  <nav
    class="mx-auto my-2 flex h-16 w-full flex-row items-center justify-between rounded-md px-4 py-2 shadow-sm md:w-1/2"
  >
    <div>
      <a href="/">
        <span class="font-semibold">Freyza Cosmeceuticals</span>
        | Employee
      </a>
    </div>

    <div class="flex flex-row gap-2">
      <a href="/auth" class={buttonVariants({ variant: "outline", size: "sm", class: "h-auto" })}>
        Login
      </a>
      <ColorModeToggle />
    </div>
  </nav>
</header>
