import { DayType } from "$lib/types"

import * as fuzz from "fuzzball"
import { read, utils } from "xlsx"

import type { LocationWithName, RouteWithName } from "$lib/types"
import type { FuzzballExtractOptions } from "fuzzball"

export type ParseResult = {
  success: boolean
  message: string
  data: any[] | null
}

const HOLIDAY_TERMS = ["HOLIDAY", "VACATION", "SUNDAY", "WEEKEND"]
const LEAVE_TERMS = ["LEAVE", "SICK", "ABSENT"]
const MIN_RATIO_SCORE = 80
const DATE_HEADER = "DATE"

/**
 * Parses the travel plan Excel file and returns the updated plan entries.
 * @param file XLSX file to parse.
 * @param currentEntries Current plan entries to update.
 * @param locations List of locations.
 * @param routes List of routes.
 * @param hqId HQ ID.
 * @returns - {@link ParseResult}.
 */
export async function parseTravelPlanExcel(
  file: File,
  currentEntries: any[],
  locations: LocationWithName[],
  routes: RouteWithName[],
  hqId: string
): Promise<ParseResult> {
  try {
    const data = await file.arrayBuffer()
    const workbook = read(data)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = utils.sheet_to_json<any[]>(worksheet, { header: 1 })

    // find DATE header
    let headerRowIndex = -1
    for (let i = 0; i < jsonData.length; i++) {
      if (jsonData[i].some((cell) => String(cell).toUpperCase().trim() === DATE_HEADER)) {
        headerRowIndex = i
        break
      }
    }

    if (headerRowIndex === -1) {
      return {
        success: false,
        message: "Could not locate a 'DATE' header in the Excel file.",
        data: null
      }
    }

    const updatedEntries = [...currentEntries]
    let matchCount = 0

    // parse the data
    for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
      const row = jsonData[i]
      if (!row || row[0] == null) continue

      const dayNum = parseInt(row[0])
      if (isNaN(dayNum)) continue

      const statusOrDestStr = String(row[2] || "")
        .trim()
        .toUpperCase()

      let dayType = DayType.WORK
      let routeId: string | undefined = undefined
      let srcLocId: string | undefined = undefined
      let destLocId: string | undefined = undefined

      // match status in destination
      if (HOLIDAY_TERMS.includes(statusOrDestStr)) {
        dayType = DayType.HOLIDAY
      } else if (LEAVE_TERMS.includes(statusOrDestStr)) {
        dayType = DayType.LEAVE
      } else if (statusOrDestStr) {
        const options: FuzzballExtractOptions = {
          // ratio for accurate matching
          scorer: fuzz.ratio,
          processor: (choice) => choice.name,
          limit: 1
        }

        // match location with fuzzy search
        const [matchedDest, score, _] = fuzz.extract(statusOrDestStr, locations, options)[0] as [
          LocationWithName,
          number,
          number
        ]

        console.debug(`matchedDest: ${matchedDest.name}, score: ${score} for ${statusOrDestStr}`)

        if (matchedDest && score >= MIN_RATIO_SCORE) {
          srcLocId = hqId
          destLocId = matchedDest.id
          const matchedRoute = routes.find(
            (r) => r.srcLoc.id === srcLocId && r.destLoc.id === destLocId
          )

          if (matchedRoute) {
            routeId = matchedRoute.id
          } else {
            console.warn(
              `HQ to ${statusOrDestStr} not matched any existing route, will auto-create`
            )
          }
        } else {
          console.warn(`${statusOrDestStr} not matched any location. ${score} score`)
        }
      } else {
        console.warn(`${statusOrDestStr}: No location or destination in row`)
      }

      console.debug(
        i,
        ". Matched ",
        statusOrDestStr,
        " to ",
        dayType,
        " with routeId ",
        routeId,
        " on ",
        dayNum
      )

      updatedEntries[dayNum - 1] = {
        ...updatedEntries[dayNum - 1],
        dayType,
        routeId: routeId || undefined,
        srcLocId: dayType === DayType.WORK ? srcLocId || undefined : undefined,
        destLocId: dayType === DayType.WORK ? destLocId || undefined : undefined
      }
      matchCount++
    }

    return {
      success: true,
      message: `Excel parsed: Updated ${matchCount} days.`,
      data: updatedEntries
    }
  } catch (error) {
    console.error("Excel Parsing Error:", error)
    return {
      success: false,
      message: "Failed to parse the Excel file.",
      data: null
    }
  }
}
