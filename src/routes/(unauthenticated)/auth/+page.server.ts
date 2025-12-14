import { error, fail, redirect } from "@sveltejs/kit"

import type { Actions } from "./$types"
import { zfd } from "zod-form-data"
import z from "zod"
import { UserRole, UserStatus } from "@db/client"

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

    const schema = zfd.formData({
      email: zfd.text(z.email()),
      password: zfd.text(),
    })

    const formData = await request.formData()
    const { data, error: parseError, success } = schema.safeParse(formData)

    if (!success) {
      console.timeEnd("LOGIN")
      console.debug("Invalid Form Data:", parseError)
      return fail(400, {
        email: formData.get("email"),
        message: JSON.parse(parseError.message)[0].message,
        error: true,
      })
    }

    const { email, password } = data
    console.debug(`Performing supabase signInWithPassword ${email}`)

    const {
      error: authError,
      data: { user: loggedInUser },
    } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      console.debug(authError)
      console.timeEnd("LOGIN")
      return fail(401, { email: email, message: authError.message, error: true })
    }

    // Prevent employees from logging in
    // FIXME: Fetch user details beforehand, do not log them in
    if (
      loggedInUser &&
      loggedInUser.user_metadata.role !== UserRole.ADMIN &&
      loggedInUser.user_metadata.status !== UserStatus.ACTIVE
    ) {
      await supabase.auth.signOut()

      console.error("User is not active admin")
      console.timeEnd("LOGIN")
      error(403, "Employees cannot login to Admin Dashboard")
    }

    if (url.searchParams.has("redirectTo")) {
      console.timeEnd("LOGIN")
      redirect(303, url.searchParams.get("redirectTo") ?? "/admin")
    }

    console.timeEnd("LOGIN")
    redirect(303, "/admin")
  },
}
