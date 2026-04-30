# Auth Specification

## Overview

Authentication and authorization system for the Freyza Employee Admin Dashboard. Uses Supabase Auth with role-based access control (RBAC).

## Tech Stack

- **Auth Provider**: Supabase Auth (PostgreSQL)
- **Session Management**: Supabase session cookies
- **Role System**: Custom `app_role` in JWT metadata

## Database Schema

### User Table

```typescript
// From schema.ts - user table
{
  id: text (UUID, primary key)
  name: varchar(100)
  email: varchar(254)
  phone: varchar(15)
  role: UserRole (ADMIN | EMPLOYEE)
  status: UserStatus (ACTIVE | REVOKED)
  tier: EmployeeTier (FSO | TABM | ASM) - only for EMPLOYEEs
  hqId: text (FK to location) - only for EMPLOYEEs
  joiningDate: date
  resignDate: date (optional)
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

## Architecture

### Server-Side Auth

```typescript
// src/lib/server/common.ts
import { requireAuthMaybeAdmin } from "./common"

// Usage in load functions and server actions
export const load = async ({ locals }) => {
  const { user, session } = requireAuthMaybeAdmin(locals)
  // user has { id, role, email, ... }
}
```

### Auth Patterns

1. **Admin Routes**: Require `user.role === "ADMIN"`
2. **Employee Routes**: Require authenticated session
3. **Public Routes**: No auth required

### RLS Policies

```sql
-- Employee can view own data
CREATE POLICY "Employees can view their own user data"
  FOR SELECT USING (auth.uid() = id);

-- Admins can view all user data
CREATE POLICY "Admins can view all user data"
  FOR SELECT USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'app_role') = 'ADMIN'
  );

-- Admins can insert users
CREATE POLICY "Admins can insert users"
  FOR INSERT WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'app_role') = 'ADMIN'
  );
```

## Components

### AccountDropdown

- Location: `src/lib/components/reusable/AccountDropdown.svelte`
- Features: User avatar, name display, logout action

### AdminProfileCard

- Location: `src/lib/components/dashboard/AdminProfileCard.svelte`
- Features: Admin user info display with profile details

## Routes

- `/login` - Public login page (unauthenticated)
- `/admin` - Dashboard home (admin only)
- `/admin/employees` - Employee management (admin only)

## Valibot Schemas

```typescript
// Add user validation
import * as v from "valibot"

export const addEmployeeSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.minLength(3)),
  email: v.pipe(v.string(), v.email()),
  phone: v.pipe(v.string(), v.minLength(10), v.maxLength(15)),
  role: v.enumType(UserRole),
  status: v.enumType(UserStatus),
  tier: v.optional(v.enumType(EmployeeTier)),
  hqId: v.optional(v.string()),
  joiningDate: v.coerce(date(), v.string())
})

export const updateEmployeeSchema = v.object({
  id: v.string(),
  name: v.optional(v.pipe(v.string(), v.trim(), v.minLength(3))),
  email: v.optional(v.pipe(v.string(), v.email())),
  phone: v.optional(v.pipe(v.string(), v.minLength(10), v.maxLength(15))),
  status: v.optional(v.enumType(UserStatus)),
  tier: v.optional(v.enumType(EmployeeTier)),
  hqId: v.optional(v.string()),
  resignDate: v.optional(v.coerce(date(), v.string()))
})
```

## Related Files

- `src/lib/server/db/user.ts` - Database operations
- `src/hooks.server.ts` - Auth hooks
- `src/lib/components/reusable/AccountDropdown.svelte`
- `src/lib/components/dashboard/AdminProfileCard.svelte`
