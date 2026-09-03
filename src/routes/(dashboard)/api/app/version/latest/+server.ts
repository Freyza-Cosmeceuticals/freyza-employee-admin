import { error, json } from "@sveltejs/kit"

import * as s from "@/lib/db/schema"
import { handleApiError, requireApiAuth } from "@/lib/server/api"
import { db } from "@/lib/server/db"
import { desc } from "drizzle-orm"

import type { RequestHandler } from "./$types"

/**
 * GET /api/app/version/latest
 * @returns The latest app version from the database
 */
export const GET: RequestHandler = async ({ request, url, locals }) => {
  const TAG = "GET /api/app/version/latest"
  console.time(TAG)

  const DOWNLOAD_EXPIRY_SECONDS = 60 * 30

  try {
    const { user, apiSupabase } = await requireApiAuth(request, locals.supabase)

    const [latest] = await db
      .select()
      .from(s.appRelease)
      .orderBy(desc(s.appRelease.buildNumber))
      .limit(1)

    if (!latest) {
      return json({ success: true, data: null })
    }

    console.log(
      `Found latest app version (${latest.id}) ${latest.versionName}-${latest.buildNumber}`
    )

    const { data: signedData, error: signError } = await apiSupabase.storage
      .from("apk_releases")
      .createSignedUrl(latest.apkStoragePath, DOWNLOAD_EXPIRY_SECONDS)

    if (signError || !signedData) {
      console.error("Failed to sign URL", signError)
      throw error(500, "Could not generate download link")
    }

    // Only rewrite in local/dev environments when targeting localhost
    const parsed = new URL(signedData.signedUrl)
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      parsed.hostname = url.hostname
    }

    let fileSizeMb = 0
    if (latest.fileSizeBytes) {
      fileSizeMb = latest.fileSizeBytes / 1024 / 1024
    }

    return json({
      success: true,
      data: {
        versionName: latest.versionName,
        buildNumber: latest.buildNumber,
        releaseNotes: latest.releaseNotes,
        isMandatory: latest.isMandatory,
        downloadUrl: parsed.toString(),
        expiresIn: DOWNLOAD_EXPIRY_SECONDS,
        fileSizeMb
      }
    })
  } catch (e) {
    throw handleApiError(e)
  } finally {
    console.timeEnd(TAG)
  }
}
