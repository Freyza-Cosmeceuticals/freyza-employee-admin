import { error } from "@sveltejs/kit"

import { TIMEZONE } from "$lib/constants"

import { DateTime } from "luxon"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ locals, params, url }) => {
  const year = Number.parseInt(params.y, 10)
  const month = Number.parseInt(params.m, 10)

  const tpMonth = DateTime.fromObject({ year, month, day: 1 }).setZone(TIMEZONE)
  if (!tpMonth.isValid) {
    error(400, "Invalid date")
  }

  return { tpMonth: tpMonth as DateTime<true> }
}
