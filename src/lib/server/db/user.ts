import * as s from "$lib/db/schema"
import { UserRole, UserStatus } from "$lib/types"

import { and, desc, eq, notInArray } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"

import { db, handleDbError, requireAuthMaybeAdmin } from "./common"
import type { Employee, EmployeeCreate, EmployeeWithHQ, User } from "$lib/types"

const sHq = alias(s.location, "hq")

/**
 * Gets the user profile associated with the current user
 */
export async function getUser(locals: App.Locals): Promise<Employee | null> {
  const TAG = "DB: getUser()"
  console.time(TAG)
  const { user, session } = requireAuthMaybeAdmin(locals, false)

  try {
    const userProfile: User | null =
      (await db.query.user.findFirst({
        where: (u, { eq }) => eq(u.id, user.id)
      })) ?? null

    return userProfile
  } catch (e) {
    console.error(e)
    return null
  } finally {
    console.timeEnd(TAG)
  }
}

export async function getUserByEmail(
  email: string
): Promise<{ data: User | null; error: null } | { data: null; error: string }> {
  const TAG = `DB: getUserByEmail(${email})`
  console.time(TAG)

  try {
    const userProfile: User | null =
      (await db.query.user.findFirst({
        where: (u, { eq }) => eq(u.email, email)
      })) ?? null

    return { data: userProfile, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
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
  const TAG = "DB: createEmployee()"
  console.time(TAG)
  const { user, session } = requireAuthMaybeAdmin(locals)

  try {
    const [employeeProfile] = await db
      .insert(s.user)
      .values({
        id: employeeData.id,
        name: employeeData.name,
        email: employeeData.email,
        phone: employeeData.phone,
        role: employeeData.role,
        status: employeeData.status,
        tier: employeeData.tier,
        hqId: employeeData.hqId,
        joiningDate: employeeData.joiningDate
      })
      .returning()

    return { data: employeeProfile, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
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
  const TAG = `DB: getAllEmployees(limitN ${limitN}, excludeIds ${excludeIds})`
  console.time(TAG)
  const { user, session } = requireAuthMaybeAdmin(locals)

  try {
    const query = db
      .select()
      .from(s.user)
      .innerJoin(sHq, eq(s.user.hqId, sHq.id))
      .where(
        and(
          eq(s.user.role, UserRole.EMPLOYEE),
          eq(s.user.status, UserStatus.ACTIVE),
          ...(excludeIds && excludeIds.length > 0 ? [notInArray(s.user.id, excludeIds)] : [])
        )
      )
      .orderBy(desc(s.user.createdAt))

    if (limitN !== undefined) {
      query.limit(limitN)
    }

    const rawEmployees = await query
    const employees = rawEmployees.map((e) => ({
      ...e.user,
      hq: e.hq
    }))

    return employees
  } catch (e) {
    console.error(e)
    return []
  } finally {
    console.timeEnd(TAG)
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
  const TAG = "DB: getEmployeeCount()"
  console.time(TAG)
  const { user, session } = requireAuthMaybeAdmin(locals)

  try {
    const count = await db.$count(
      s.user,
      and(eq(s.user.role, UserRole.EMPLOYEE), eq(s.user.status, UserStatus.ACTIVE))
    )

    return { data: count, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}
