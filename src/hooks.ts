import { DateTime } from "luxon"

import type { Transport } from "@sveltejs/kit"

export const transport: Transport = {
  DateTime: {
    encode: (value) => DateTime.isDateTime(value) && value.toISO(),
    decode: (d) => DateTime.fromISO(d)
  }
}
