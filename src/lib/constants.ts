import { EmployeeTier } from "@prisma/client"

export const SUPABASE_AUTH_TAG = "supabase:auth"

export const EMPLOYEE_TIERS: { value: EmployeeTier; label: string }[] = [
  { value: EmployeeTier.FSO, label: "Field Sales Officer" },
  { value: EmployeeTier.TABM, label: "Training Area Business Manager" },
  { value: EmployeeTier.ASM, label: "Area Sales Manager" },
]
