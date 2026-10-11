import { error, json } from "@sveltejs/kit"

import { handleApiError, requireApiAuth } from "@/lib/server/api"
import { getAppRelease } from "@/lib/server/db/app_release"
import * as v from "valibot"

import type { RequestHandler } from "./$types"
import type { ApiIssue } from "@/lib/server/api"

const appDownloadSchema = v.object({
  versionName: v.pipe(
    v.string("versionName is required"),
    v.minLength(1, "versionName is required")
  ),
  buildNumber: v.pipe(v.string(), v.toNumber())
})

/**
 * GET /api/app/download?versionName={versionName}&buildNumber={buildNumber}
 * @returns The latest app version from the database
 */
export const GET: RequestHandler = async ({ request, url, locals }) => {
  const TAG = "GET /api/app/download"
  console.time(TAG)

  const DOWNLOAD_EXPIRY_SECONDS = 60 * 30 // 30 minutes

  try {
    const { user, apiSupabase } = await requireApiAuth(request, locals.supabase)

    const params = {
      versionName: url.searchParams.get("versionName") ?? "",
      buildNumber: url.searchParams.get("buildNumber") ?? ""
    }

    const parsed = v.safeParse(appDownloadSchema, params)

    if (!parsed.success) {
      const issues: ApiIssue[] = []

      for (const iss of parsed.issues) {
        issues.push({
          kind: iss.kind,
          input: iss.input,
          received: iss.received,
          message: iss.message,
          path: iss.path?.map((p) => ({ key: p.key })) ?? []
        })
      }

      console.error(parsed.issues)
      throw error(400, { message: "Invalid payload", data: issues })
    }

    const { versionName, buildNumber } = parsed.output

    const { data: release, error: releaseError } = await getAppRelease(
      locals,
      versionName,
      buildNumber
    )
    if (releaseError) {
      throw releaseError
    }

    if (!release) {
      return json({ success: true, data: null, message: "No app version found" }, { status: 404 })
    }

    const { data: signedData, error: signError } = await apiSupabase.storage
      .from("apk_releases")
      .createSignedUrl(release.apkStoragePath, DOWNLOAD_EXPIRY_SECONDS)

    if (signError || !signedData) {
      console.error("Failed to sign URL", signError)
      throw error(500, "Could not generate download link")
    }

    // Only rewrite in local/dev environments when targeting localhost
    const parsedUrl = new URL(signedData.signedUrl)
    if (parsedUrl.hostname === "localhost" || parsedUrl.hostname === "127.0.0.1") {
      parsedUrl.hostname = url.hostname
    }

    let fileSizeMb = 0
    if (release.fileSizeBytes) {
      fileSizeMb = release.fileSizeBytes / 1024 / 1024
    }

    return json({
      success: true,
      data: {
        versionName: release.versionName,
        buildNumber: release.buildNumber,
        releaseNotes: release.releaseNotes,
        isMandatory: release.isMandatory,
        downloadUrl: parsedUrl.toString(),
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
