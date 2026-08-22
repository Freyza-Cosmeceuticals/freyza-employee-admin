<!-- src/routes/admin/releases/components/release-upload-dialog.svelte -->
<script lang="ts">
import { type RemoteFormIssue } from "@sveltejs/kit"

import { Button } from "@ui/button"
import { Checkbox } from "@ui/checkbox"
import * as Dialog from "@ui/dialog"
import * as Field from "@ui/field"
import { Input } from "@ui/input"
import { Textarea } from "@ui/textarea"

import { createAppRelease } from "$lib/api/app_release.remote"

import LoaderCircle from "@lucide/svelte/icons/loader-circle"
import UploadCloudIcon from "@lucide/svelte/icons/upload-cloud"
import { toast } from "svelte-sonner"

let dialogOpen = $state(false)
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

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger>
    {#snippet child({ props })}
      <Button {...props}>
        <UploadCloudIcon class="mr-2 h-4 w-4" />
        New Release
      </Button>
    {/snippet}
  </Dialog.Trigger>

  <Dialog.Content class="sm:max-w-125">
    <Dialog.Header>
      <Dialog.Title>Upload New APK</Dialog.Title>
      <Dialog.Description>Deploy a new version to your users.</Dialog.Description>
    </Dialog.Header>

    <form
      {...createAppRelease.enhance(async (form) => {
        const toastId = toast.loading("Uploading release...")
        console.debug("Submitting data", {
          ...form.fields.value()
        })

        try {
          if (await form.submit()) {
            const result = form.result
            if (!result) {
              toast.error("Unexpected Error", { id: toastId })
              console.error("Unexpected Error: result is null even when submit succeeded", result)
              return
            }

            // handle unsuccess
            if (result && (!result.data || !result.success)) {
              throw result.message
            }

            form.element.reset()
            dialogOpen = false

            toast.success("Release uploaded successfully", {
              id: toastId,
              description: `Version ${result.data.versionName} (${result.data.buildNumber}) has been published`
            })
            console.debug("Release uploaded", result.data)
          } else {
            toast.error("Look for validation errors in the form", { id: toastId })
            console.warn(form.fields.allIssues())
          }
        } catch (e: any) {
          const error = e instanceof Error ? e : new Error(e || "An Internal Error Occurred")
          toast.error(error.message, {
            id: toastId
          })
          console.error(error)
        }
      })}
      enctype="multipart/form-data">
      <Field.Group>
        <Field.Set>
          <Field.Group>
            <div class="grid grid-cols-2 gap-4">
              <Field.Field>
                <Field.Content>
                  <Field.Label for="versionName">Version Name</Field.Label>
                  <Field.Error>
                    {@render errorListSnippet(createAppRelease.fields.versionName.issues() ?? [])}
                  </Field.Error>
                </Field.Content>
                <Input
                  placeholder="e.g. 1.2.0"
                  required
                  disabled={createAppRelease.pending > 0}
                  {...createAppRelease.fields.versionName.as("text")} />
              </Field.Field>

              <Field.Field>
                <Field.Content>
                  <Field.Label for="buildNumber">Build Number</Field.Label>
                  <Field.Error>
                    {@render errorListSnippet(createAppRelease.fields.buildNumber.issues() ?? [])}
                  </Field.Error>
                </Field.Content>
                <Input
                  placeholder="e.g. 15"
                  required
                  disabled={createAppRelease.pending > 0}
                  {...createAppRelease.fields.buildNumber.as("text")}
                  type="number" />
              </Field.Field>
            </div>

            <Field.Field>
              <Field.Content>
                <Field.Label for="releaseNotes">Release Notes</Field.Label>
                <Field.Error>
                  {@render errorListSnippet(createAppRelease.fields.releaseNotes.issues() ?? [])}
                </Field.Error>
              </Field.Content>
              {const releaseNotesField = createAppRelease.fields.releaseNotes.as("text")}
              <Textarea
                rows={3}
                disabled={createAppRelease.pending > 0}
                name={releaseNotesField.name}
                aria-invalid={releaseNotesField["aria-invalid"]} />
            </Field.Field>

            <Field.Field>
              <Field.Content>
                <Field.Label for="apkFile">APK File</Field.Label>
                <Field.Error>
                  {@render errorListSnippet(createAppRelease.fields.apkFile.issues() ?? [])}
                </Field.Error>
              </Field.Content>
              {const apkFileField = createAppRelease.fields.apkFile.as("file")}
              <Input
                type="file"
                name={apkFileField.name}
                aria-invalid={apkFileField["aria-invalid"]}
                accept=".apk"
                required
                disabled={createAppRelease.pending > 0} />
            </Field.Field>

            <Field.Field orientation="horizontal" class="items-center gap-2">
              {const isMandatoryField = createAppRelease.fields.isMandatory.as("text")}
              <Checkbox
                disabled={createAppRelease.pending > 0}
                name={isMandatoryField.name}
                aria-invalid={isMandatoryField["aria-invalid"]} />
              <Field.Label for="isMandatory">Mandatory Update</Field.Label>
              <Field.Error>
                {@render errorListSnippet(createAppRelease.fields.isMandatory.issues() ?? [])}
              </Field.Error>
            </Field.Field>
          </Field.Group>
        </Field.Set>

        <Dialog.Footer class="pt-4">
          <Button
            variant="outline"
            type="button"
            onclick={() => (dialogOpen = false)}
            disabled={createAppRelease.pending > 0}>
            Cancel
          </Button>
          <Button disabled={createAppRelease.pending > 0} type="submit">
            {#if createAppRelease.pending > 0}
              <LoaderCircle class="animate-spin" />
              Uploading...
            {:else}
              Deploy Release
            {/if}
          </Button>
        </Dialog.Footer>
      </Field.Group>
    </form>
  </Dialog.Content>
</Dialog.Root>
