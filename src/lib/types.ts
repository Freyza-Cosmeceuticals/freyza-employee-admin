import type { Location, Route, User } from "@prisma/client"

export type LocationCreate = Omit<Location, "id" | "createdAt" | "updatedAt">
export type RouteCreate = Omit<Route, "id" | "createdAt" | "updatedAt">

export type Employee = User
export type EmployeeCreate = Omit<User, "id" | "createdAt" | "updatedAt"> & { id?: string }
export type UserCreate = Omit<User, "id" | "createdAt" | "updatedAt"> & { id?: string }
