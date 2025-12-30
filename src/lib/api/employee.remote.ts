import { createEmployee } from "@/server/db/user"
import { supabaseAdmin } from "@/server/supabaseAdmin"
import type { EmployeeCreate } from "@/types"
import { EmployeeTier, UserRole, UserStatus } from "@db/client"

import * as v from "valibot"

import { form, getRequestEvent } from "$app/server"

import { requireAuthMaybeAdmin } from "./common"

const addEmployeeSchema = v.object({
  name: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(3, "Name must be at least 3 characters long."),
    v.maxLength(30, "Name is too long.")
  ),
  phone: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(10, "Phone number must be at least 10 characters long."),
    v.maxLength(15, "Phone number is too long.")
  ),
  tier: v.enum(EmployeeTier, "Invalid Tier"),
  hqId: v.pipe(v.string(), v.trim(), v.uuid("Please select a valid HQ.")),
  joiningDate: v.pipe(v.string(), v.toDate("Invalid Date")),
  email: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty("Please enter an email."),
    v.email("The email format is incorrect."),
    v.maxLength(30, "The email is too long.")
  )
})

export const addEmployee = form(addEmployeeSchema, async (employee) => {
  const { locals } = getRequestEvent()
  const { user, session, supabase } = requireAuthMaybeAdmin(locals)

  console.debug("Adding Employee with data", employee)

  const potentialEmployee = await supabaseAdmin.auth.admin.createUser({
    email: employee.email,
    password: "12345678",
    email_confirm: true,
    user_metadata: {
      role: UserRole.EMPLOYEE,
      status: UserStatus.ACTIVE,
      name: employee.name
    }
  })

  if (!potentialEmployee.data.user) {
    console.error(potentialEmployee.error)
    return { success: false, data: null, message: potentialEmployee.error?.message }
  }

  const employeeData: EmployeeCreate = {
    id: potentialEmployee.data.user.id,
    name: employee.name,
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
    return { success: false, data: null, message: error }
  }

  console.debug("Successfully added employee", employeeProfile)

  return { data: employeeProfile, success: true, message: "Employee added successfully" }
})
