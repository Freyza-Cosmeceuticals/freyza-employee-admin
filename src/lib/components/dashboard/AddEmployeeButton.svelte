<script lang="ts">
import { addEmployee } from "@/api/employee.remote"
import { fetchLocations } from "@/api/location.remote"
import { Button } from "@/components/ui/button"
import * as Dialog from "@/components/ui/dialog"
import * as Field from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import * as Select from "@/components/ui/select"
import { EMPLOYEE_TIERS } from "@/constants"
import type { EmployeeTier, Location } from "@db/browser"
import CirclePlus from "@lucide/svelte/icons/circle-plus"
import LoaderCircle from "@lucide/svelte/icons/loader-circle"
import { type RemoteFormIssue } from "@sveltejs/kit"
import { toast } from "svelte-sonner"

let open = $state(false)

let tierSelected = $state<string | EmployeeTier>("Select Tier")
let tierLabel = $derived.by(() => {
  const found = EMPLOYEE_TIERS.find((tier) => tier.value == tierSelected)
  if (found) {
    return `${found.label} (${found.value.toUpperCase()})`
  }

  return "Select Tier"
})

let locations = $state<Location[] | null>(null)
locations = await fetchLocations()

let hqSelected = $state<string>("Select HQ")
let hqLabel = $derived.by(() => {
  const found = locations?.find((location) => location.id == hqSelected)
  if (found) {
    return found.name
  }

  return "Select HQ"
})
</script>

{#snippet errorListSnippet(issues: RemoteFormIssue[])}
  {#if issues.length > 0}
    <ul>
      {#each issues as issue}
        <li>{issue.message}</li>
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
  <Dialog.Content class="sm:max-w-[625px]">
    <Dialog.Header>
      <Dialog.Title>Add new employee</Dialog.Title>
      <Dialog.Description>Create a new Employee at Freyza</Dialog.Description>
    </Dialog.Header>

    <form
      {...addEmployee.enhance(async ({ form, data, submit }) => {
        const toastId = toast.loading("Hold tight! Creating employee...")
        console.debug("Submitting data", data)

        try {
          await submit()

          if (addEmployee.result?.success && addEmployee.result.data) {
            form.reset()
            open = false

            toast.success(addEmployee.result.message, {
              id: toastId,
              description: `${addEmployee.result.data.name} has joined the team`
            })
            console.log(addEmployee.result.message, addEmployee.result.data)
          } else {
            if (addEmployee.fields.allIssues()) {
              toast.error("Look for validation errors in the form", { id: toastId })
              console.error(addEmployee.fields.allIssues())
            } else {
              toast.error(addEmployee.result?.message ?? "An Internal Error Occurred", {
                id: toastId
              })

              console.error(addEmployee.result?.message)
            }
          }
        } catch (error) {
          toast.error("An Internal Error Occurred", {
            id: toastId
          })

          console.error(error)
        }
      })}>
      <Field.Group>
        <Field.Set>
          <Field.Separator />
          <Field.Group>
            <Field.Field orientation="responsive">
              <Field.Content>
                <Field.Label for="name">Name</Field.Label>
                <Field.Description>Employee Name</Field.Description>
                <Field.Error>
                  {@render errorListSnippet(addEmployee.fields.name.issues() ?? [])}
                </Field.Error>
              </Field.Content>
              <Input
                placeholder="Enter Name"
                required
                disabled={addEmployee.pending > 0}
                {...addEmployee.fields.name.as("text")} />
            </Field.Field>

            <Field.Field orientation="responsive">
              <Field.Content>
                <Field.Label for="email">Email</Field.Label>
                <Field.Description>Contact email address</Field.Description>
                <Field.Error>
                  {@render errorListSnippet(addEmployee.fields.email.issues() ?? [])}
                </Field.Error>
              </Field.Content>
              <Input
                placeholder="Enter Email"
                required
                disabled={addEmployee.pending > 0}
                {...addEmployee.fields.email.as("email")} />
            </Field.Field>

            <Field.Field orientation="responsive">
              <Field.Content>
                <Field.Label for="phone">Phone</Field.Label>
                <Field.Description>Contact phone number</Field.Description>
                <Field.Error>
                  {@render errorListSnippet(addEmployee.fields.phone.issues() ?? [])}
                </Field.Error>
              </Field.Content>
              <Input
                placeholder="Enter Phone"
                required
                disabled={addEmployee.pending > 0}
                {...addEmployee.fields.phone.as("text")} />
            </Field.Field>

            <Field.Field orientation="responsive">
              <Field.Content>
                <Field.Label for="tier">Tier</Field.Label>
                <Field.Description>Tier of the employee</Field.Description>
                <Field.Error>
                  {@render errorListSnippet(addEmployee.fields.tier.issues() ?? [])}
                </Field.Error>
              </Field.Content>
              <Select.Root
                type="single"
                disabled={addEmployee.pending > 0}
                bind:value={tierSelected}
                required>
                <Select.Trigger name={addEmployee.fields.tier.as("select").name}>
                  {tierLabel}
                </Select.Trigger>
                <Select.Content>
                  {#each EMPLOYEE_TIERS as tier (tier.value)}
                    <Select.Item {...tier} />
                  {/each}
                </Select.Content>
              </Select.Root>

              <!-- actual form element to be sent along, hidden on purpose -->
              <!-- TODO: upgrade this to use the form fields directly, not native select -->
              <select {...addEmployee.fields.tier.as("select")} value={tierSelected} hidden>
                {#each EMPLOYEE_TIERS as tier (tier.value)}
                  <option value={tier.value}>{tier.label}</option>
                {/each}
              </select>
            </Field.Field>

            <Field.Field orientation="responsive">
              <Field.Content>
                <Field.Label for="hqId">Headquarters</Field.Label>
                <Field.Description>Headquarters of the employee</Field.Description>
                <Field.Error>
                  {@render errorListSnippet(addEmployee.fields.hqId.issues() ?? [])}
                </Field.Error>
              </Field.Content>
              <Select.Root
                type="single"
                disabled={addEmployee.pending > 0}
                bind:value={hqSelected}
                required>
                <Select.Trigger>
                  {hqLabel}
                </Select.Trigger>
                <Select.Content>
                  {#each locations as loc (loc.id)}
                    <Select.Item value={loc.id} label={loc.name} />
                  {/each}
                </Select.Content>
              </Select.Root>

              <!-- actual form element to be sent along, hidden on purpose -->
              <!-- TODO: upgrade this to use the form fields directly, not native select -->
              <select {...addEmployee.fields.hqId.as("select")} value={hqSelected} hidden>
                {#each locations as loc (loc.id)}
                  <option value={loc.id}>{loc.name}</option>
                {/each}
              </select>
            </Field.Field>

            <Field.Field orientation="responsive">
              <Field.Content>
                <Field.Label for="joiningDate">Joining Date</Field.Label>
                <Field.Description>Joining date of the employee</Field.Description>
                <Field.Error>
                  {@render errorListSnippet(addEmployee.fields.joiningDate.issues() ?? [])}
                </Field.Error>
              </Field.Content>
              <Input
                placeholder="Select Joining Date"
                required
                disabled={addEmployee.pending > 0}
                {...addEmployee.fields.joiningDate.as("date")} />
            </Field.Field>
          </Field.Group>
        </Field.Set>

        <Field.Field orientation="horizontal">
          <Button disabled={addEmployee.pending > 0} type="submit">
            {#if addEmployee.pending > 0}
              <LoaderCircle class="animate-spin" />
            {:else}
              Create Employee
            {/if}
          </Button>
        </Field.Field>
      </Field.Group>
    </form>
    <Dialog.Footer></Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
