<script lang="ts">
import { Button } from "@/components/ui/button"
import * as Dialog from "@/components/ui/dialog"
import CirclePlus from "@lucide/svelte/icons/circle-plus"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
</script>

<Dialog.Root>
  <Dialog.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="secondary">
        <CirclePlus />
        Add Employee
      </Button>
    {/snippet}
  </Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Add new employee</Dialog.Title>
      <Dialog.Description>Create a new Employee at Freyza</Dialog.Description>
    </Dialog.Header>

    <div class="grid gap-4 py-4">
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="name" class="text-right">Name</Label>
        <Input id="name" class="col-span-3" name="name" placeholder="Enter Name" required />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="email" class="text-right">Email</Label>
        <Input
          id="email"
          type="email"
          name="email"
          class="col-span-3"
          placeholder="Enter Email"
          required
        />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="phone" class="text-right">Phone</Label>
        <Input
          id="phone"
          type="number"
          name="phone"
          class="col-span-3"
          placeholder="Enter Phone"
          required
        />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="location" class="text-right">Location</Label>
        <Input id="location" class="col-span-3" placeholder="Enter Location" required />
      </div>
    </div>
    <Dialog.Footer>
      <Button type="submit">Create Employee</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
