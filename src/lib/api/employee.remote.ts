import { form, getRequestEvent } from "$app/server"
import { createUser } from "@/server/db/user"
import { supabaseAdmin } from "@/server/supabaseAdmin"
import { UserRole, UserStatus, type User } from "@prisma/client"
import { error } from "@sveltejs/kit"
import { z } from "zod"

const addEmployeeSchema = z.object({
  name: z.string().min(3).max(20),
  email: z.email(),
  phone: z.string().min(10).max(15),
  location: z.string().min(3).max(50),
})

function requireAuth() {
  const { locals } = getRequestEvent()

  if (!locals.user || !locals.session) {
    console.error("Unauthorized call to employee remote function")
    error(401, "Unauthorized")
  }

  return locals
}

export const addEmployee = form(addEmployeeSchema, async employee => {
  const locals = requireAuth()
  const { supabase, session, user } = locals

  if (
    user?.user_metadata.role !== UserRole.ADMIN &&
    user?.user_metadata.status !== UserStatus.ACTIVE
  ) {
    console.error("Unauthorized call to employee remote function")
    error(403, "Forbidden")
  }

  console.debug("Adding Employee with data", employee)

  const potentialEmployee = await supabaseAdmin.auth.admin.createUser({
    email: employee.email,
    password: "12345678",
    email_confirm: true,
    user_metadata: {
      role: UserRole.EMPLOYEE,
      status: UserStatus.UNCONFIRMED,
      name: employee.name,
      location: employee.location,
    },
  })

  if (!potentialEmployee.data.user) {
    console.error(potentialEmployee.error)
    error(500, "Failed to create employee")
  }

  const employeeData = {
    id: potentialEmployee.data.user.id,
    name: employee.name,
    phone: employee.phone,
    location: employee.location,
    role: UserRole.EMPLOYEE,
    status: UserStatus.UNCONFIRMED,
  }

  const employeeProfile = await createUser(locals, employeeData)

  if (!employeeProfile) {
    console.error("Failed to create employee profile")
    error(500, "Failed to create employee")
  }

  console.debug("Successfully added employee", employeeProfile)
})
