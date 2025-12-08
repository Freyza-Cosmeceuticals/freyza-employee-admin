import prisma from "@/server/db/prisma"
import type { Employee, EmployeeCreate, EmployeeWithHQ } from "@/types"
import { Prisma, UserRole, UserStatus, type User } from "@db/client"
import { requireAdminAuth } from "./common"

export async function getUser(locals: App.Locals): Promise<User | null> {
  const { user, session } = requireAdminAuth(locals, false)

  console.debug("Trying to getUser associated to the current user")
  try {
    const userProfile: User | null = await prisma.user.findFirst({
      where: {
        id: user.id,
      },
    })

    console.debug(userProfile ? "Okay so user profile was found" : "No User profile exists")
    return userProfile
  } catch (e) {
    console.error(e)
    return null
  }
}

export async function createEmployee(
  locals: App.Locals,
  employeeData: EmployeeCreate,
): Promise<{ data: Employee; error: null } | { data: null; error: string }> {
  const { user, session } = requireAdminAuth(locals)

  console.debug("Creating employee profile with data", employeeData)

  try {
    const employeeProfile: Employee | null = await prisma.user.create({
      data: {
        id: employeeData.id,
        name: employeeData.name,
        phone: employeeData.phone,
        role: employeeData.role,
        status: employeeData.status,
        tier: employeeData.tier,
        hqId: employeeData.hqId,
        joiningDate: employeeData.joiningDate,
      },
    })

    console.debug(employeeProfile ? "Created successfully" : "Unable to create")
    return { data: employeeProfile, error: null }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(e)
      return { data: null, error: e.message }
    }

    console.error(e)
    return { data: null, error: "An unknown error has occurred" }
  }
}

export async function getAllEmployees(
  locals: App.Locals,
  limitN?: number,
): Promise<EmployeeWithHQ[]> {
  const { user, session } = requireAdminAuth(locals)

  try {
    const employees = await prisma.user.findMany({
      where: {
        role: UserRole.EMPLOYEE,
        status: UserStatus.ACTIVE,
      },
      include: {
        hq: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limitN,
    })

    console.debug(`Found ${employees.length} employees with limitN ${limitN}`)
    return employees
  } catch (e) {
    console.error(e)
    return []
  }
}
