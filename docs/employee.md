# Employee Specification

## Overview

Employee management system for the Freyza Employee Admin Dashboard. Manages employee profiles, their headquarters (HQ), tiers, and employment status.

## Database Schema

### User Table

```typescript
// Primary employee table
{
  id: text (UUID, primary key, auto-generated)
  name: varchar(100) - required
  email: varchar(254) - unique
  phone: varchar(15) - unique
  role: UserRole - required (ADMIN | EMPLOYEE)
  status: UserStatus - required (ACTIVE | REVOKED)
  tier: EmployeeTier - required (FSO | TABM | ASM)
  hqId: text (FK to location) - nullable (only for EMPLOYEES)
  joiningDate: date - required
  resignDate: date - nullable
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Enums

```typescript
enum UserRole {
  ADMIN = "ADMIN"
  EMPLOYEE = "EMPLOYEE"
}

enum UserStatus {
  ACTIVE = "ACTIVE"
  REVOKED = "REVOKED"
}

enum EmployeeTier {
  FSO = "FSO"    // Field Sales Officer
  TABM = "TABM"  // Training Area Business Manager
  ASM = "ASM"    // Area Sales Manager
}
```

## TypeScript Types

```typescript
type User = InferSelectModel<typeof user>
type Employee = User
type EmployeeWithHQ = Employee & { hq: Pick<Location, "id" | "name" | "operational"> | null }

type EmployeeCreate = InferInsertModel<typeof user>
```

## Components

### EmployeeItem

- Location: `src/lib/components/dashboard/employee/EmployeeItem.svelte`
- Props: `{ employee: EmployeeWithHQ, variant?: ItemVariant }`
- Features: Display employee card with name, email, phone, HQ, tier, status

### EmployeeList

- Location: `src/lib/components/dashboard/EmployeeList.svelte`
- Props: `{ employees: EmployeeWithHQ[] }`
- Features: Grid/list of employee items with search/filter

### EmployeeSelectComboBox

- Location: `src/lib/components/dashboard/EmployeeSelectComboBox.svelte`
- Props: `{ value?: string, onchange?: (id: string) => void }`
- Features: Dropdown to select employee for travel plans

### AddEmployeeButton

- Location: `src/lib/components/dashboard/AddEmployeeButton.svelte`
- Features: Button to trigger add employee dialog

## Routes

- `/admin/employees` - Employee list page
- `/admin/employees/[employeeId]` - Employee detail (future)

## Database Operations

```typescript
// src/lib/server/db/user.ts
// Pattern: return { data: T, error: null } | { data: null, error: string }

getEmployeesDb(locals) // Get all employees with HQ
getEmployeeByIdDb(locals, id) // Get single employee
createEmployeeDb(locals, data) // Create employee
updateEmployeeDb(locals, id, data) // Update employee
deleteEmployeeDb(locals, id) // Soft delete (set resignDate)
```

## Valibot Schemas

```typescript
// src/lib/formSchemas.ts

export const addEmployeeSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.minLength(3, "Name must be at least 3 characters")),
  email: v.pipe(v.string(), v.email("Invalid email address")),
  phone: v.pipe(v.string(), v.minLength(10, "Phone must be at least 10 digits")),
  role: v.enumType(UserRole),
  status: v.enumType(UserStatus),
  tier: v.enumType(EmployeeTier), // Non-optional for employees
  hqId: v.optional(v.string()),
  joiningDate: v.coerce(v.date(), v.string("Invalid date"))
})

export const updateEmployeeSchema = v.object({
  id: v.string(),
  name: v.optional(v.pipe(v.string(), v.trim(), v.minLength(3))),
  email: v.optional(v.pipe(v.string(), v.email())),
  phone: v.optional(v.pipe(v.string(), v.minLength(10))),
  status: v.optional(v.enumType(UserStatus)),
  tier: v.enumType(EmployeeTier), // Non-optional for employees
  hqId: v.optional(v.string()),
  resignDate: v.optional(v.coerce(v.date(), v.string()))
})
```

## Related Files

- `src/lib/db/schema.ts` - Database schema
- `src/lib/types.ts` - TypeScript types
- `src/lib/constants.ts` - Enums and constants
- `src/lib/formSchemas.ts` - Validation schemas
- `src/lib/server/db/user.ts` - Database operations
- `src/lib/api/*.remote.ts` - Remote functions
- `src/routes/(dashboard)/admin/employees/+page.svelte` - Employee list page
