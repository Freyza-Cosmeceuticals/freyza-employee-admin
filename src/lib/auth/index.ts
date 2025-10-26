import prisma from "@/server/prisma"
import type { User } from "@prisma/client"

export async function getUser({ user, session }: App.Locals): Promise<User | null> {
  console.debug("Trying to getUser associated to the current user")

  if (!user) {
    console.error("Oh current user is non-existent, return")
    return null
  }

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
