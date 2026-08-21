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
    v.transform((value) => value === "on")
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

  try {
    const filePath = `${versionName}-${buildNumber}/${apkFile.name}`

    const { error: uploadError } = await supabase.storage
      .from("apk_releases")
      .upload(filePath, apkFile, { cacheControl: "3600", upsert: false })

    if (uploadError !== null) {
      console.error("Failed to upload APK", uploadError)
      throw error(500, "Failed to upload APK")
    }

    const { data: newRelease, error: dbError } = await createAppReleaseDb(
      locals,
      versionName,
      buildNumber,
      releaseNotes,
      isMandatory,
      filePath
    )

    if (dbError !== null) {
      console.error("Failed to create app release", dbError)
      throw error(500, "Failed to create app release")
    }

    return { success: true, data: newRelease }
  } catch (e) {
    console.log("Error creating app release", e)
    return { success: false, data: null }
  } finally {
    console.timeEnd(TAG)
  }
})
