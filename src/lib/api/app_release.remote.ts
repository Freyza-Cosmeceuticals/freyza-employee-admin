import { form, getRequestEvent, query } from "$app/server"
import { error, invalid } from "@sveltejs/kit"

import {
  createAppRelease as createAppReleaseDb,
  getAllAppReleases
} from "$lib/server/db/app_release"

import * as v from "valibot"

import { requireAuthMaybeAdmin } from "./common"

const CreateAppReleaseSchema = v.object({
  versionName: v.pipe(v.string(), v.minLength(1, "Version Name is required")),
  buildNumber: v.pipe(v.string(), v.toNumber()),
  releaseNotes: v.string(),
  isMandatory: v.pipe(
    v.optional(v.string(), ""),
    v.transform((value) => value === "on" || value === "true")
  ),
  apkFile: v.file()
})

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
 * Creates a new app release
 * Requires ADMIN
 */
export const createAppRelease = form(CreateAppReleaseSchema, async (data, issue) => {
  let TAG = `Remote: createAppRelease(${data})`
  console.time(TAG)

  const { locals } = getRequestEvent()
  const { claims, supabase } = await requireAuthMaybeAdmin(locals, true)

  const { versionName, buildNumber, releaseNotes, isMandatory, apkFile } = data

  if (!apkFile.name.endsWith(".apk")) {
    invalid(issue.apkFile("Uploaded file must be an .apk"))
  }

  const filePath = `${versionName}-${buildNumber}/${apkFile.name}`
  const { error: uploadError } = await supabase.storage
    .from("apk_releases")
    .upload(filePath, apkFile, { cacheControl: "3600", upsert: false })

  if (uploadError !== null) {
    console.error("Failed to upload APK", uploadError)
    console.timeEnd(TAG)
    return { success: false, data: null, message: "Failed to upload APK", status: 500 }
  }

  const newReleaseResult = await createAppReleaseDb(
    locals,
    versionName,
    buildNumber,
    releaseNotes,
    isMandatory,
    filePath
  )

  if (newReleaseResult.error !== null) {
    console.error("Failed to create app release", newReleaseResult.error)

    console.log("Removing stale uploaded apk")
    await supabase.storage.from("apk_releases").remove([filePath])

    if (newReleaseResult.constraintName === "app_release_buildNumber_unique") {
      console.timeEnd(TAG)
      invalid(issue.buildNumber("Build number must be unique"))
    }

    console.timeEnd(TAG)
    return { success: false, data: null, message: "Failed to create app release", status: 500 }
  }

  console.timeEnd(TAG)
  return { success: true, data: newReleaseResult.data, status: 201 }
})
