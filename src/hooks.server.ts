import { randomUUID } from "crypto"
import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import { redirect } from "@sveltejs/kit"
import { sequence } from "@sveltejs/kit/hooks"

import { createServerClient } from "@supabase/ssr"
import { DateTime } from "luxon"

import type { Handle } from "@sveltejs/kit"

const SUPABASE_HANDLE_TAG = "Supabase Handle"
const AUTH_GUARD_TAG = "Auth Guard"

const colors = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bright: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m"
}

const supabase: Handle = async ({ event, resolve }) => {
  console.time(
    `${colors.dim}[${event.locals.requestId.substr(0, 5)}]${colors.reset} ${SUPABASE_HANDLE_TAG}`
  )

  /**
   * Creates a Supabase client specific to this server request.
   *
   * The Supabase client gets the Auth token from the request cookies.
   */
  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        /**
         * Note: You have to add the `path` variable to the
         * set and remove method due to sveltekit's cookie API
         * requiring this to be set, setting the path to `/`
         * will replicate previous/standard behavior (https://kit.svelte.dev/docs/types#public-types-cookies)
         */
        cookiesToSet.forEach(({ name, value, options }) => {
          event.cookies.set(name, value, { ...options, path: "/" })
        })
        if (Object.keys(headers).length > 0) {
          event.setHeaders(headers)
        }
      }
    }
  })

  if ("suppressGetSessionWarning" in event.locals.supabase.auth) {
    // @ts-expect-error - suppressGetSessionWarning is not part of the official API
    event.locals.supabase.auth.suppressGetSessionWarning = true
  } else {
    console.warn(
      "SupabaseAuthClient#suppressGetSessionWarning was removed. See https://github.com/supabase/supabase-js/issues/1709."
    )
  }

  /**
   * Unlike `supabase.auth.getSession()`, which returns the session _without_
   * validating the JWT, this function also calls `getUser()` to validate the
   * JWT before returning the session.
   * TODO: Look into using .getClaims() instead of .getUser(), which is now faster and safer
   */
  event.locals.safeGetSession = async () => {
    const {
      data: { session }
    } = await event.locals.supabase.auth.getSession()
    if (!session) {
      return { session: null, user: null }
    }

    const {
      data: { user },
      error
    } = await event.locals.supabase.auth.getUser()
    if (error) {
      // JWT validation has failed
      return { session: null, user: null }
    }

    return { session, user }
  }

  console.timeEnd(
    `${colors.dim}[${event.locals.requestId.substr(0, 5)}]${colors.reset} ${SUPABASE_HANDLE_TAG}`
  )

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      /**
       * Supabase libraries use the `content-range` and `x-supabase-api-version`
       * headers, so we need to tell SvelteKit to pass it through.
       */
      return name === "content-range" || name === "x-supabase-api-version"
    }
  })
}

const authGuard: Handle = async ({ event, resolve }) => {
  console.time(
    `${colors.dim}[${event.locals.requestId.substr(0, 5)}]${colors.reset} ${AUTH_GUARD_TAG}`
  )

  const { session, user } = await event.locals.safeGetSession()
  event.locals.session = session
  event.locals.user = user

  if (!event.locals.session && event.url.pathname.startsWith("/admin")) {
    redirect(303, "/auth?redirectTo=" + event.url.pathname)
  }

  if (event.locals.session && event.url.pathname.startsWith("/auth")) {
    redirect(303, "/admin")
  }

  console.timeEnd(
    `${colors.dim}[${event.locals.requestId.substr(0, 5)}]${colors.reset} ${AUTH_GUARD_TAG}`
  )

  return resolve(event)
}

const logHandle: Handle = async ({ event, resolve }) => {
  event.locals.requestId = randomUUID()
  const requestId = event.locals.requestId
  const timestamp = DateTime.now().toISO()

  const requestType = event.isRemoteRequest ? "REMOTE" : event.isDataRequest ? "DATA" : "HTTP"

  // timestamp [requestId] -> method path (requestType)
  console.log(
    `${colors.cyan}${timestamp}${colors.reset} ${colors.bright}[${requestId}]${colors.reset} ${colors.green}→${colors.reset} ${event.request.method} ${event.url.pathname} ${colors.dim}(${requestType})${colors.reset}`
  )

  const startTime = Date.now()
  const response = await resolve(event)
  const duration = Date.now() - startTime

  const statusColor =
    response.status >= 400 ? colors.red : response.status >= 300 ? colors.yellow : colors.green

  // timestamp [requestId] <- status (duration)
  console.log(
    `${colors.cyan}${DateTime.now().toISO()}${colors.reset} ${colors.bright}[${requestId}]${colors.reset} ${colors.green}←${colors.reset} ${statusColor}${response.status}${colors.reset} ${colors.dim}(${duration}ms)${colors.reset}`
  )
  console.log("")

  return response
}

export const handle: Handle = sequence(logHandle, supabase, authGuard)
