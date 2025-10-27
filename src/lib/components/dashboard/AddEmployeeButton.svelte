<script lang="ts">
import { Button } from "@/components/ui/button"
import * as Dialog from "@/components/ui/dialog"
import CirclePlus from "@lucide/svelte/icons/circle-plus"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { addEmployee } from "@/api/employee.remote"
import LoaderCircle from "@lucide/svelte/icons/loader-circle"
import { type RemoteFormIssue } from "@sveltejs/kit"

let open = $state(false)
</script>

{#snippet errorListSnippet(issues: RemoteFormIssue[])}
  {#if issues.length > 0}
    <ul class="col-span-4">
      {#each issues as issue}
        <li class="text-destructive py-1 text-right text-sm">{issue.message}</li>
      {/each}
    </ul>
  {:else}{/if}
{/snippet}

<Dialog.Root bind:open>
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

    <form
      {...addEmployee.enhance(async ({ form, data, submit }) => {
        try {
          console.debug("Submitting data", data)
          await submit()
        } catch (error) {
          alert("Error")
        }

        // form.reset()
        // open = false
      })}
      class="grid gap-4 py-4"
    >
      <div class="grid grid-cols-4 items-center">
        <Label for="name" class="text-right">Name</Label>
        <Input
          class="col-span-3"
          placeholder="Enter Name"
          required
          disabled={addEmployee.pending > 0}
          {...addEmployee.fields.name.as("text")}
        />
        {@render errorListSnippet(addEmployee.fields.name.issues() ?? [])}
      </div>

      <div class="grid grid-cols-4 items-center">
        <Label for="email" class="text-right">Email</Label>
        <Input
          class="col-span-3"
          placeholder="Enter Email"
          required
          disabled={addEmployee.pending > 0}
          {...addEmployee.fields.email.as("email")}
        />
        {@render errorListSnippet(addEmployee.fields.email.issues() ?? [])}
      </div>

      <div class="grid grid-cols-4 items-center">
        <Label for="phone" class="text-right">Phone</Label>
        <Input
          class="col-span-3"
          placeholder="Enter Phone"
          required
          disabled={addEmployee.pending > 0}
          {...addEmployee.fields.phone.as("text")}
        />
        {@render errorListSnippet(addEmployee.fields.phone.issues() ?? [])}
      </div>

      <div class="grid grid-cols-4 items-center">
        <Label for="location" class="text-right">Location</Label>
        <Input
          class="col-span-3"
          placeholder="Enter Location"
          required
          disabled={addEmployee.pending > 0}
          {...addEmployee.fields.location.as("text")}
        />
        {@render errorListSnippet(addEmployee.fields.location.issues() ?? [])}
      </div>

      <Button type="submit" disabled={addEmployee.pending > 0}>
        {#if addEmployee.pending > 0}
          <LoaderCircle class="animate-spin" />
        {:else}
          Create Employee
        {/if}
      </Button>
    </form>
    <Dialog.Footer></Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
