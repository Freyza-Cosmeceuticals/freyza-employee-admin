<!-- src/routes/admin/releases/components/release-upload-dialog.svelte -->
<script lang="ts">
import { page } from "$app/state"

import { Button } from "@ui/button"
import { Checkbox } from "@ui/checkbox"
import * as Dialog from "@ui/dialog"
import { Input } from "@ui/input"
import { Label } from "@ui/label"
import { Textarea } from "@ui/textarea"

import { createAppRelease } from "$lib/api/app_release.remote"

import AlertCircleIcon from "@lucide/svelte/icons/circle-alert"
import UploadCloudIcon from "@lucide/svelte/icons/upload-cloud"

let dialogOpen = $state(false)
let isUploading = $state(false)
</script>

<Dialog.Root bind:open={dialogOpen}>
  <Button onclick={() => (dialogOpen = true)}>
    <UploadCloudIcon class="mr-2 h-4 w-4" />
    New Release
  </Button>

  <Dialog.Content class="sm:max-w-125">
    <Dialog.Header>
      <Dialog.Title>Upload New APK</Dialog.Title>
      <Dialog.Description>Deploy a new version to your users.</Dialog.Description>
    </Dialog.Header>

    {#if page.error}
      <div class="flex flex-col gap-1 rounded bg-destructive/15 p-3 text-sm text-destructive">
        <div class="flex items-center gap-2 font-medium">
          <AlertCircleIcon class="h-4 w-4" /> Submission Failed
        </div>
        <span class="pl-6 text-xs text-destructive/80">
          {page.error.message}
        </span>
      </div>
    {/if}

    <form {...createAppRelease} enctype="multipart/form-data" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="versionName">Version Name</Label>
          <Input
            id="versionName"
            name="versionName"
            placeholder="e.g. 1.2.0"
            disabled={isUploading} />
        </div>
        <div class="space-y-2">
          <Label for="buildNumber">Build Number</Label>
          <Input
            id="buildNumber"
            name="buildNumber"
            type="number"
            placeholder="e.g. 15"
            disabled={isUploading} />
        </div>
      </div>

      <div class="space-y-2">
        <Label for="releaseNotes">Release Notes</Label>
        <Textarea id="releaseNotes" name="releaseNotes" rows={3} disabled={isUploading} />
      </div>

      <div class="space-y-2 pt-2">
        <Label for="apkFile">APK File</Label>
        <Input id="apkFile" name="apkFile" type="file" accept=".apk" disabled={isUploading} />
      </div>

      <div class="flex items-center space-x-2 pt-2 pb-4">
        <Checkbox id="isMandatory" name="isMandatory" disabled={isUploading} />
        <Label for="isMandatory">Mandatory Update</Label>
      </div>

      <Dialog.Footer>
        <Button
          variant="outline"
          type="button"
          onclick={() => (dialogOpen = false)}
          disabled={isUploading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Deploy Release"}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
