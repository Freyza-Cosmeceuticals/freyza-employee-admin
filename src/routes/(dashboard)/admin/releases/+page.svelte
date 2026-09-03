<script lang="ts">
import * as Alert from "@ui/alert"
import { Button } from "@ui/button"
import { Skeleton } from "@ui/skeleton"

import { fetchAppReleases } from "@/lib/api/app_release.remote"
import PageHeader from "@/lib/components/dashboard/PageHeader.svelte"
import DataTable from "@/lib/components/dashboard/table/data-table.svelte"
import CircleAlertIcon from "@lucide/svelte/icons/circle-alert"

import { columns } from "./columns"
import UploadReleaseButton from "./UploadReleaseButton.svelte"
</script>

<svelte:head>
  <title>App Releases | Freyza Cosmeceuticals Employee System</title>
  <meta name="description" content="App releases page for Freyza Cosmeceuticals Employee System" />
</svelte:head>

<div class="h-auto space-y-8 px-4 py-8">
  <PageHeader title="App Releases" description="Keep employees app updated">
    {#snippet action()}
      <UploadReleaseButton />
    {/snippet}
  </PageHeader>

  <div class="mt-4">
    <svelte:boundary>
      {const data = $derived(await fetchAppReleases())}

      <DataTable {data} {columns} />

      {#snippet pending()}
        <Skeleton class="h-64 w-full" />
      {/snippet}

      {#snippet failed(error, reset)}
        {@debug error}
        <Alert.Root variant="destructive">
          <CircleAlertIcon class="size-4" />
          <Alert.Title>Error</Alert.Title>
          <Alert.Description>
            Something went wrong while listing releases. Please try again.
          </Alert.Description>
          <Alert.Action>
            <Button variant="ghost" onclick={reset}>Retry</Button>
          </Alert.Action>
        </Alert.Root>
      {/snippet}
    </svelte:boundary>
  </div>
</div>
