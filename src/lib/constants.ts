import { EmployeeTier } from "@db/browser"

export const TIMEZONE = "Asia/Kolkata"
export const SUPABASE_AUTH_TAG = "supabase:auth"

export const N_EMPLOYEES_HOME = 5
export const EMPLOYEE_TIERS: { value: EmployeeTier; label: string }[] = [
  { value: EmployeeTier.FSO, label: "Field Sales Officer" },
  { value: EmployeeTier.TABM, label: "Training Area Business Manager" },
  { value: EmployeeTier.ASM, label: "Area Sales Manager" }
] as const

export const NUM_PAST_MONTHS_TRAVEL_PLAN = 2
