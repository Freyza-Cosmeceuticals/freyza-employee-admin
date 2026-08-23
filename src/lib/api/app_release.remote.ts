import { form, getRequestEvent, query } from "$app/server"
import { error, invalid } from "@sveltejs/kit"

import {
  createAppRelease as createAppReleaseDb,
  getAllAppReleases
} from "$lib/server/db/app_release"

import * as v from "valibot"

import { requireAuthMaybeAdmin } from "./common"

const PrepareApkUploadSchema = v.object({
  versionName: v.pipe(v.string(), v.minLength(1, "Version Name is required")),
  buildNumber: v.pipe(v.string(), v.toNumber()),
  filename: v.pipe(
    v.string(),
    v.check((val) => val.endsWith(".apk"), "Uploaded file must be an .apk")
  )
})

const CreateAppReleaseSchema = v.object({
  versionName: v.pipe(v.string(), v.minLength(1, "Version Name is required")),
  buildNumber: v.pipe(v.string(), v.toNumber()),
  releaseNotes: v.string(),
  isMandatory: v.pipe(
    v.optional(v.string(), ""),
    v.transform((value) => value === "on" || value === "true")
  ),
  apkFilePath: v.pipe(v.string(), v.minLength(1, "File path is required"))
})

const buildApkFileName = (versionName: string, buildNumber: number, filename: string): string => {
  return `${versionName}-${buildNumber}/${filename}`
}

/**
 * Fetch all app releases
 * Does not require ADMIN
 */
export const fetchAppReleases = query(async () => {
  const { locals } = getRequestEvent()
  const { claims, supabase } = await requireAuthMaybeAdmin(locals, false)

  const { data, error: dbError } = await getAllAppReleases(locals)
  if (dbError !== null) {
    console.error("Failed to get app releases", dbError)
    error(500, "Failed to get app releases")
  }

  return data
})

/**
 * Step 1: Validates metadata & creates signed upload URL
 * Required ADMIN
 */
export const prepareApkUpload = query(PrepareApkUploadSchema, async (data) => {
  let TAG = `Remote: prepareApkUpload(${data.versionName}-${data.buildNumber})`
  console.time(TAG)

  const { locals } = getRequestEvent()
  const { supabase } = await requireAuthMaybeAdmin(locals, true)
  const { versionName, buildNumber, filename } = data

  const filePath = buildApkFileName(versionName, buildNumber, filename)

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("apk_releases")
    .createSignedUploadUrl(filePath, { upsert: false })

  console.timeEnd(TAG)

  if (uploadError !== null) {
    console.error("Failed to create signed upload URL", uploadError)
    return { success: false, data: null, message: "Failed to generate upload URL", status: 500 }
  }

  return {
    success: true,
    data: {
      signedUrl: uploadData.signedUrl,
      token: uploadData.token,
      filePath
    },
    status: 200
  }
})

/**
 * Step 2: Creates a new app release after upload is done
 * Requires ADMIN
 */
export const createAppRelease = form(CreateAppReleaseSchema, async (data, issue) => {
  let TAG = `Remote: createAppRelease(${data.versionName}-${data.buildNumber})`
  console.time(TAG)

  const { locals } = getRequestEvent()
  const { claims, supabase } = await requireAuthMaybeAdmin(locals, true)

  const { versionName, buildNumber, releaseNotes, isMandatory, apkFilePath } = data

  const newReleaseResult = await createAppReleaseDb(
    locals,
    versionName,
    buildNumber,
    releaseNotes,
    isMandatory,
    apkFilePath
  )

  if (newReleaseResult.error !== null) {
    console.error("Failed to create app release", newReleaseResult.error)
    console.log("Removing stale uploaded apk")
    await supabase.storage.from("apk_releases").remove([apkFilePath])

    if (newReleaseResult.constraintName === "app_release_buildNumber_unique") {
      console.timeEnd(TAG)
      invalid(issue.buildNumber("Build number must be unique"))
    }

    console.timeEnd(TAG)
    return { success: false, data: null, message: "Failed to create app release", status: 500 }
  }

  fetchAppReleases().refresh()

  console.timeEnd(TAG)
  return { success: true, data: newReleaseResult.data, status: 201 }
})
