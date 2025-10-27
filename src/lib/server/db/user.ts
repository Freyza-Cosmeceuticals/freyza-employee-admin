import prisma from "@/server/db/prisma"
import { UserRole, UserStatus, type User } from "@prisma/client"
import { redirect } from "@sveltejs/kit"

export async function getUser({ user, session }: App.Locals): Promise<User | null> {
  if (!user) {
    console.error("Oh current user is non-existent, return")
    redirect(303, "/login")
  }

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

export async function createUser(
  { user, session }: App.Locals,
  userData: Omit<User, "createdAt" | "updatedAt">,
): Promise<User | null> {
  if (!user) {
    console.error("Oh current user is non-existent, return")
    redirect(303, "/login")
  }

  console.debug("Creating user profile with data", userData)

  try {
    const userProfile: User | null = await prisma.user.create({
      data: {
        id: userData.id,
        name: userData.name,
        role: userData.role,
        status: userData.status,
        location: userData.location,
      },
    })

    console.debug(userProfile ? "Created successfully" : "Unable to create")
    return userProfile
  } catch (e) {
    console.error(e)
    return null
  }
}

export async function getAllEmployees(
  { user, session }: App.Locals,
  limitN?: number,
): Promise<User[]> {
  if (!user) {
    console.error("Oh current user is non-existent, return")
    redirect(303, "/login")
  }

  try {
    const employees = await prisma.user.findMany({
      where: {
        role: UserRole.EMPLOYEE,
        OR: [
          {
            status: UserStatus.UNCONFIRMED,
          },
          {
            status: UserStatus.ACTIVE,
          },
        ],
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
