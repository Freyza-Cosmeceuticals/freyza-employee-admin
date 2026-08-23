<script lang="ts">
import { type RemoteFormIssue } from "@sveltejs/kit"

import { Button } from "@ui/button"
import { Checkbox } from "@ui/checkbox"
import * as Dialog from "@ui/dialog"
import * as Field from "@ui/field"
import { Input } from "@ui/input"
import { Textarea } from "@ui/textarea"

import { createAppRelease, prepareApkUpload } from "$lib/api/app_release.remote"

import LoaderCircle from "@lucide/svelte/icons/loader-circle"
import UploadCloudIcon from "@lucide/svelte/icons/upload-cloud"
import { tick } from "svelte"
import { toast } from "svelte-sonner"

let dialogOpen = $state(false)
let selectedFile = $state<File | null>(null)
let isUploading = $state(false)

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile = target.files[0]
  } else {
    selectedFile = null
  }
}
</script>

{#snippet errorListSnippet(issues: RemoteFormIssue[])}
  {#if issues.length > 0}
    <ul class="list-inside list-disc text-xs text-destructive">
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
        if (!selectedFile) {
          toast.error("Please select an APK file")
          return
        }

        if (!selectedFile.name.endsWith(".apk")) {
          toast.error("Uploaded file must be an .apk")
          return
        }

        const toastId = toast.loading("Uploading release...")
        isUploading = true

        try {
          // 1. Request presigned  upload URL
          const values = form.fields.value()
          const prepareResult = await prepareApkUpload({
            versionName: values.versionName ?? "",
            buildNumber: values.buildNumber ?? "0",
            filename: selectedFile.name
          })

          if (!prepareResult.success || !prepareResult.data) {
            throw new Error(prepareResult.message || "Failed to initialize upload ticket")
          }

          console.log("Upload Prepare result", prepareResult)
          const { signedUrl, filePath } = prepareResult.data

          // 2. Direct binary transfer from browser to Supabase Storage
          toast.loading("Uploading APK file...", { id: toastId })
          const uploadResponse = await fetch(signedUrl, {
            method: "PUT",
            headers: {
              "Content-Type": "application/vnd.android.package-archive"
            },
            body: selectedFile
          })

          if (!uploadResponse.ok) {
            throw new Error(`Direct storage upload failed: ${uploadResponse.statusText}`)
          }

          console.log("Upload response", uploadResponse)

          // 3. Set the verified filePath in the form payload
          form.fields.apkFilePath.set(filePath)
          createAppRelease.fields.apkFilePath.set(filePath)

          // // wait for svelte to flush the updates to DOM
          await tick()

          // 4. Submit form
          toast.loading("Publishing release...", { id: toastId })
          console.debug("Submitting data", {
            ...form.fields.value()
          })

          if (await form.submit()) {
            const result = form.result
            if (!result || !result.data || !result.success) {
              throw new Error(result?.message || "Failed to finalize release")
            }

            form.element.reset()
            selectedFile = null
            dialogOpen = false

            toast.success("Release uploaded successfully", {
              id: toastId,
              description: `Version ${result.data.versionName}-${result.data.buildNumber} has been published`
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
        } finally {
          isUploading = false
        }
      })}>
      {let apkFilePath = $derived(createAppRelease.fields.apkFilePath.value() ?? "")}
      <!-- Hidden field carrying storage location to avoid binary payload -->
      <input hidden {...createAppRelease.fields.apkFilePath.as("text")} value={apkFilePath} />

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
                  disabled={isUploading || createAppRelease.pending > 0}
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
                  disabled={isUploading || createAppRelease.pending > 0}
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
                disabled={isUploading || createAppRelease.pending > 0}
                name={releaseNotesField.name}
                aria-invalid={releaseNotesField["aria-invalid"]} />
            </Field.Field>

            <Field.Field>
              <Field.Content>
                <Field.Label for="apkFile">APK File</Field.Label>
                <Field.Error>
                  {@render errorListSnippet(createAppRelease.fields.apkFilePath.issues() ?? [])}
                </Field.Error>
              </Field.Content>
              <Input
                type="file"
                id="apkFile"
                accept=".apk"
                required
                disabled={isUploading || createAppRelease.pending > 0}
                onchange={handleFileChange} />
            </Field.Field>

            <Field.Field orientation="horizontal" class="items-center gap-2">
              {const isMandatoryField = createAppRelease.fields.isMandatory.as("text")}
              <Checkbox
                disabled={isUploading || createAppRelease.pending > 0}
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
            disabled={isUploading || createAppRelease.pending > 0}>
            Cancel
          </Button>
          <Button disabled={isUploading || createAppRelease.pending > 0} type="submit">
            {#if isUploading || createAppRelease.pending > 0}
              <LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
              Processing...
            {:else}
              Deploy Release
            {/if}
          </Button>
        </Dialog.Footer>
      </Field.Group>
    </form>
  </Dialog.Content>
</Dialog.Root>
