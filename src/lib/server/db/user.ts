import prisma from "$lib/server/db/prisma"
import { UserRole, UserStatus } from "@db/client"

import { handleDbError, requireAuthMaybeAdmin } from "./common"
import type { User } from "@db/client"
import type { Employee, EmployeeCreate, EmployeeWithHQ } from "$lib/types"

/**
 * Gets the user profile associated with the current user
 */
export async function getUser(locals: App.Locals): Promise<User | null> {
  const { user, session } = requireAuthMaybeAdmin(locals, false)

  console.debug("Trying to getUser associated to the current user")
  try {
    const userProfile: User | null = await prisma.user.findFirst({
      where: {
        id: user.id
      }
    })

    console.debug(userProfile ? "Okay so user profile was found" : "No User profile exists")
    return userProfile
  } catch (e) {
    console.error(e)
    return null
  }
}

/**
 * Creates a new Employee User
 * @param locals
 * @param employeeData
 */
export async function createEmployee(
  locals: App.Locals,
  employeeData: EmployeeCreate
): Promise<{ data: Employee; error: null } | { data: null; error: string }> {
  const { user, session } = requireAuthMaybeAdmin(locals)

  console.debug("Creating employee profile with data", employeeData)

  try {
    const employeeProfile = await prisma.user.create({
      data: {
        id: employeeData.id,
        name: employeeData.name,
        phone: employeeData.phone,
        role: employeeData.role,
        status: employeeData.status,
        tier: employeeData.tier,
        hqId: employeeData.hqId,
        joiningDate: employeeData.joiningDate
      }
    })

    console.debug("Created successfully")
    return { data: employeeProfile, error: null }
  } catch (e) {
    return handleDbError(e)
  }
}

/**
 * Returns all Active Employees in the db, optionally limited by a number or excluding certain ids
 * @param locals
 * @param limitN Limit to certain count, ordered by joining date (recent first)
 * @param excludeIds Optional array of employee ids to exclude from the result
 * @returns
 */
export async function getAllEmployees(
  locals: App.Locals,
  limitN?: number,
  excludeIds?: string[]
): Promise<EmployeeWithHQ[]> {
  const { user, session } = requireAuthMaybeAdmin(locals)

  try {
    const employees = await prisma.user.findMany({
      where: {
        role: UserRole.EMPLOYEE,
        status: UserStatus.ACTIVE,
        id: {
          notIn: excludeIds || []
        }
      },
      include: {
        hq: { select: { name: true, id: true, operational: true } }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: limitN
    })

    console.debug(`Found ${employees.length} employees with limitN ${limitN}`)
    if (excludeIds) console.debug(`...excluding ${excludeIds.length} ids`)

    return employees
  } catch (e) {
    console.error(e)
    return []
  }
}

/**
 * Returns the count of active employees in the db
 * @param locals
 * @returns
 */
export async function getEmployeeCount(
  locals: App.Locals
): Promise<{ data: number; error: null } | { data: null; error: string }> {
  const { user, session } = requireAuthMaybeAdmin(locals)

  try {
    const count = await prisma.user.count({
      where: {
        role: UserRole.EMPLOYEE,
        status: UserStatus.ACTIVE
      }
    })

    console.debug(`Found ${count} active employees`)
    return { data: count, error: null }
  } catch (e) {
    return handleDbError(e)
  }
}
