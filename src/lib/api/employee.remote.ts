import { form, getRequestEvent } from "$app/server"

import { createEmployee } from "$lib/server/db/user"
import { supabaseAdmin } from "$lib/server/supabaseAdmin"
import { UserRole, UserStatus } from "$lib/types"

import { addEmployeeSchema } from "@/lib/formSchemas"

import { requireAuthMaybeAdmin } from "./common"
import type { EmployeeCreate } from "$lib/types"

export const addEmployee = form(addEmployeeSchema, async (employee) => {
  const { locals } = getRequestEvent()
  const { user, session, supabase } = requireAuthMaybeAdmin(locals)

  console.debug("Adding Employee with data", employee)

  const potentialEmployee = await supabaseAdmin.auth.admin.createUser({
    email: employee.email,
    password: "12345678",
    email_confirm: true,
    user_metadata: {
      name: employee.name
    },
    app_metadata: {
      app_role: UserRole.EMPLOYEE,
      app_status: UserStatus.ACTIVE
    }
  })

  if (!potentialEmployee.data.user) {
    console.error(potentialEmployee.error)
    return { success: false, data: null, message: potentialEmployee.error?.message }
  }

  const employeeData: EmployeeCreate = {
    id: potentialEmployee.data.user.id,
    name: employee.name,
    email: employee.email,
    phone: employee.phone,
    role: UserRole.EMPLOYEE,
    status: UserStatus.ACTIVE,
    tier: employee.tier,
    hqId: employee.hqId,
    joiningDate: employee.joiningDate,
    resignDate: null
  }

  const { data: employeeProfile, error } = await createEmployee(locals, employeeData)

  if (!employeeProfile) {
    console.error("Failed to create employee profile", error)

    // try to delete the auth user
    // TODO: Collect failed to delete in logs to delete them later
    try {
      await supabase.auth.admin.deleteUser(potentialEmployee.data.user.id)
      console.log(
        `Successfully undone auth createUser for employee id ${potentialEmployee.data.user.id}`
      )
    } catch (error) {
      console.error(
        `Failed to undo auth createUser for employee id ${potentialEmployee.data.user.id}`,
        error
      )
    }

    return { success: false, data: null, message: error }
  }

  console.debug("Successfully added employee", employeeProfile)

  return { data: employeeProfile, success: true, message: "Employee added successfully" }
})
