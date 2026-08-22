import { appRelease } from "@/lib/db/schema"

import { db, handleDbError } from "./common"
import type { AppRelease } from "$lib/types"

/**
 * Get all App Releases from the db
 */
export async function getAllAppReleases(
  locals: App.Locals
): Promise<{ data: AppRelease[]; error: null } | { data: null; error: string }> {
  const TAG = "DB: getAllAppReleases()"
  console.time(TAG)

  try {
    const releases: AppRelease[] = await db.query.appRelease.findMany({
      orderBy: (release, { desc }) => desc(release.createdAt)
    })

    return { data: releases, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}

export async function createAppRelease(
  locals: App.Locals,
  versionName: string,
  buildNumber: number,
  releaseNotes: string,
  isMandatory: boolean,
  filePath: string
): Promise<
  { data: AppRelease; error: null } | { data: null; error: string; constraintName?: string }
> {
  const TAG = "DB: createAppRelease()"
  console.time(TAG)

  try {
    const [release] = await db
      .insert(appRelease)
      .values({
        versionName,
        buildNumber,
        releaseNotes,
        isMandatory,
        apkStoragePath: filePath
      })
      .returning()

    return { data: release, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}
