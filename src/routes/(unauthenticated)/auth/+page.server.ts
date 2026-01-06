import { error, fail, redirect } from "@sveltejs/kit"

import { UserRole, UserStatus } from "$lib/types"

import { getUserByEmail as getUserByEmailDb } from "@/lib/server/db/user"
import * as v from "valibot"

import type { Actions } from "./$types"

export const actions: Actions = {
  // signup: async ({ request, locals: { supabase } }) => {
  //   const formData = await request.formData()
  //   const email = formData.get("email") as string
  //   const password = formData.get("password") as string

  //   const { error } = await supabase.auth.signUp({ email, password })
  //   if (error) {
  //     console.error(error)
  //     redirect(303, "/auth/error")
  //   } else {
  //     redirect(303, "/")
  //   }
  // },

  login: async ({ request, locals: { supabase }, url }) => {
    console.time("LOGIN")

    const schema = v.object({
      email: v.pipe(v.string(), v.email("Email is not valid")),
      password: v.pipe(v.string(), v.minLength(8, "Password must be at least 8 characters long"))
    })

    const loginData = Object.fromEntries(await request.formData())
    const { output: data, issues: parseError, success } = v.safeParse(schema, loginData)

    if (!success) {
      console.debug("Invalid Form Data:", parseError)
      console.timeEnd("LOGIN")
      return fail(400, {
        email: loginData.email,
        message: parseError[0].message,
        error: true
      })
    }

    const { email, password } = data

    // check user role first, SHOULD be ACTIVE ADMIn
    const potentialUser = await getUserByEmailDb(email)
    if (potentialUser.error || !potentialUser.data) {
      console.error("Error Fetching User By Email: ", potentialUser.error)
      console.timeEnd("LOGIN")
      return fail(500, { email, message: "Internal Server Error", error: true })
    }

    if (
      potentialUser.data.role !== UserRole.ADMIN ||
      potentialUser.data.status !== UserStatus.ACTIVE
    ) {
      console.error("User is not active admin")
      console.timeEnd("LOGIN")
      error(403, "Employees or Revoked Admins cannot login to Admin Dashboard")
    }

    console.debug(`Performing supabase signInWithPassword ${email}`)

    const {
      error: authError,
      data: { user: loggedInUser }
    } = await supabase.auth.signInWithPassword({ email, password })

    if (authError || !loggedInUser) {
      console.debug(authError)
      console.timeEnd("LOGIN")
      return fail(401, {
        email: email,
        message: authError?.message || "An error occurred",
        error: true
      })
    }

    // Defensive Check
    if (
      loggedInUser.app_metadata.app_role !== UserRole.ADMIN ||
      loggedInUser.app_metadata.app_status !== UserStatus.ACTIVE
    ) {
      await supabase.auth.signOut()

      console.error("User is not active admin")
      console.timeEnd("LOGIN")
      error(403, "Employees or Revoked Admins cannot login to Admin Dashboard")
    }

    if (url.searchParams.has("redirectTo")) {
      console.log("Redirecting to ", url.searchParams.get("redirectTo"))
      console.timeEnd("LOGIN")
      redirect(303, url.searchParams.get("redirectTo") ?? "/admin")
    }

    console.timeEnd("LOGIN")
    redirect(303, "/admin")
  }
}
