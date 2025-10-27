import { error, fail, redirect } from "@sveltejs/kit"

import type { Actions } from "./$types"
import { zfd } from "zod-form-data"
import z from "zod"

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

  login: async ({ request, locals: { supabase } }) => {
    const schema = zfd.formData({
      email: zfd.text(z.email()),
      password: zfd.text(),
    })

    const formData = await request.formData()
    const { data, error: parseError, success } = schema.safeParse(formData)

    if (!success) {
      console.debug("Invalid Form Data:", parseError)
      return fail(400, {
        email: formData.get("email"),
        message: JSON.parse(parseError.message)[0].message,
        error: true,
      })
    }

    const { email, password } = data
    console.debug(`Performing supabase signInWithPassword ${email}`)

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      console.debug(authError)
      return fail(401, { email: email, message: authError.message, error: true })
    }

    redirect(303, "/admin")
  },
}
