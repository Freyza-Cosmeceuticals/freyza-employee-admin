export enum UserRole {
  ADMIN = "ADMIN",
  EMPLOYEE = "EMPLOYEE"
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  REVOKED = "REVOKED"
}

export enum EmployeeTier {
  FSO = "FSO", // field sales officer
  TABM = "TABM", // training area business manager
  ASM = "ASM" // area sales manager
}

export enum DayType {
  WORK = "WORK",
  HOLIDAY = "HOLIDAY",
  LEAVE = "LEAVE"
}

export enum ReportStatus {
  SAVED = "SAVED",
  LOCKED = "LOCKED"
}

export enum VisitType {
  DOCTOR = "DOCTOR",
  STOCKIST = "STOCKIST",
  CHEMIST = "CHEMIST"
}

export const TIMEZONE = "Asia/Kolkata"
export const SUPABASE_AUTH_TAG = "supabase:auth"

export const N_EMPLOYEES_HOME = 5
export const EMPLOYEE_TIERS: { value: EmployeeTier; label: string }[] = [
  { value: EmployeeTier.FSO, label: "Field Sales Officer" },
  { value: EmployeeTier.TABM, label: "Training Area Business Manager" },
  { value: EmployeeTier.ASM, label: "Area Sales Manager" }
] as const

export const NUM_PAST_MONTHS_TRAVEL_PLAN = 2
export const NUM_PAST_DAYS_DAILY_REPORT = 5
