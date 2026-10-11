import * as s from "$lib/db/schema"

import { appRelease } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"

import { db, handleDbError } from "./common"
import type { AppRelease, AppReleaseData } from "$lib/types"

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

export async function getAppRelease(
  locals: App.Locals,
  versionName: string,
  buildNumber: number
): Promise<{ data: AppReleaseData | null; error: null } | { data: null; error: string }> {
  const TAG = `DB: getAppRelease(${versionName}-${buildNumber})`
  console.time(TAG)

  try {
    const [release] = await db
      .select({
        versionName: s.appRelease.versionName,
        buildNumber: s.appRelease.buildNumber,
        releaseNotes: s.appRelease.releaseNotes,
        isMandatory: s.appRelease.isMandatory,
        apkStoragePath: s.appRelease.apkStoragePath,
        fileSizeBytes: s.appRelease.fileSizeBytes
      })
      .from(s.appRelease)
      .where(
        and(eq(s.appRelease.versionName, versionName), eq(s.appRelease.buildNumber, buildNumber))
      )
      .limit(1)

    return { data: release, error: null }
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
  filePath: string,
  fileSizeBytes?: number
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
        apkStoragePath: filePath,
        fileSizeBytes
      })
      .returning()

    return { data: release, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}
