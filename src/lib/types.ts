import { Prisma, type Location, type Route, type User } from "@prisma/client"

export type LocationCreate = Omit<Location, "id" | "createdAt" | "updatedAt">
export type RouteCreate = Omit<Route, "id" | "createdAt" | "updatedAt">

export type Employee = User
export type EmployeeCreate = Omit<User, "id" | "createdAt" | "updatedAt"> & { id?: string }

const employeeWithHq = Prisma.validator<Prisma.UserDefaultArgs>()({ include: { hq: true } })

export type EmployeeWithHQ = Prisma.UserGetPayload<typeof employeeWithHq>
export type UserCreate = Omit<User, "id" | "createdAt" | "updatedAt"> & { id?: string }
