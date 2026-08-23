<script lang="ts">
import { fetchAppReleases } from "@/lib/api/app_release.remote"
import PageHeader from "@/lib/components/dashboard/PageHeader.svelte"
import DataTable from "@/lib/components/dashboard/table/data-table.svelte"
import { Button } from "@/lib/components/ui/button"
import { Skeleton } from "@/lib/components/ui/skeleton"

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
        <div class="rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">
          Failed to load releases <Button variant="outline" onclick={reset}>Retry</Button>
        </div>
      {/snippet}
    </svelte:boundary>
  </div>
</div>
