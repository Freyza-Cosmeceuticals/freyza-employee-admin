<script lang="ts">
import { Button } from "@ui/button"
import * as Dialog from "@ui/dialog"

import { toast } from "svelte-sonner"
</script>

<Dialog.Root>
  <Dialog.Trigger>
    <Button>Create Location</Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Create Location</Dialog.Title>
    </Dialog.Header>
    <p class="py-4">Not implemented yet.</p>
    <Dialog.Footer>
      <Dialog.Close>
        <Button variant="outline" onclick={() => toast.info("Not implemented yet.")}>Close</Button>
      </Dialog.Close>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
