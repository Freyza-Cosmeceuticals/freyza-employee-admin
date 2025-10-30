import { form, getRequestEvent } from "$app/server"
import { createEmployee } from "@/server/db/user"
import { supabaseAdmin } from "@/server/supabaseAdmin"
import type { EmployeeCreate } from "@/types"
import { EmployeeTier, UserRole, UserStatus, type User } from "@prisma/client"
import { z } from "zod"
import { requireAdminAuth } from "./common"

const addEmployeeSchema = z.object({
  name: z.string().min(3).max(20),
  phone: z.string().min(10).max(15),
  tier: z.enum(EmployeeTier),
  hqId: z.string(),
  joiningDate: z.coerce.date<string>(),

  email: z.email(),
})

export const addEmployee = form(addEmployeeSchema, async employee => {
  const { locals } = getRequestEvent()
  const { user, session, supabase } = requireAdminAuth(locals)

  console.debug("Adding Employee with data", employee)

  const potentialEmployee = await supabaseAdmin.auth.admin.createUser({
    email: employee.email,
    password: "12345678",
    email_confirm: true,
    user_metadata: {
      role: UserRole.EMPLOYEE,
      status: UserStatus.ACTIVE,
      name: employee.name,
    },
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
    resignDate: null,
  }

  const { data: employeeProfile, error } = await createEmployee(locals, employeeData)

  if (!employeeProfile) {
    console.error("Failed to create employee profile", error)
    return { success: false, data: null, message: error }
  }

  console.debug("Successfully added employee", employeeProfile)

  return { data: employeeProfile, success: true, message: "Employee added successfully" }
})
