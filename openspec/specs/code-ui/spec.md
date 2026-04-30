# UI Components Specification

## Overview

Reusable UI component library built on shadcn-svelte (bits-ui) with TailwindCSS v4 styling.
All components follow the same patterns and are used throughout the dashboard.

## Component Library

### Layout Components

| Component        | Path                                                   | Description                   |
| ---------------- | ------------------------------------------------------ | ----------------------------- |
| PageHeader       | `src/lib/components/dashboard/PageHeader.svelte`       | Page title and actions header |
| AppNavbar        | `src/lib/components/dashboard/AppNavbar.svelte`        | Top navigation bar            |
| AppSidebar       | `src/lib/components/dashboard/AppSidebar.svelte`       | Side navigation menu          |
| AdminProfileCard | `src/lib/components/dashboard/AdminProfileCard.svelte` | Admin user info card          |
| UserCard         | `src/lib/components/dashboard/UserCard.svelte`         | Generic user display card     |

### Dashboard Components

| Component              | Path                                                               | Description                |
| ---------------------- | ------------------------------------------------------------------ | -------------------------- |
| EmployeeItem           | `src/lib/components/dashboard/employee/EmployeeItem.svelte`        | Employee list item         |
| EmployeeList           | `src/lib/components/dashboard/EmployeeList.svelte`                 | Employee list container    |
| EmployeeSelectComboBox | `src/lib/components/dashboard/EmployeeSelectComboBox.svelte`       | Employee dropdown selector |
| AddEmployeeButton      | `src/lib/components/dashboard/AddEmployeeButton.svelte`            | Add employee trigger       |
| TravelPlanCard         | `src/lib/components/dashboard/travelplan/TravelPlanCard.svelte`    | Travel plan display        |
| PlanCalendar           | `src/lib/components/dashboard/travelplan/PlanCalendar.svelte`      | Calendar view              |
| AddTravelPlanCard      | `src/lib/components/dashboard/travelplan/AddTravelPlanCard.svelte` | Travel plan form           |
| ViewPlanCalendar       | `src/lib/components/dashboard/travelplan/ViewPlanCalendar.svelte`  | Read-only calendar         |
| DailyReportCard        | `src/lib/components/dashboard/dailyreport/DailyReportCard.svelte`  | Daily report display       |
| VisitCard              | `src/lib/components/dashboard/VisitCard.svelte`                    | Visit detail card          |
| RouteSelectComboBox    | `src/lib/components/dashboard/RouteSelectComboBox.svelte`          | Route dropdown selector    |
| TasksList              | `src/lib/components/dashboard/TasksList.svelte`                    | Task list display          |

### Reusable Components

| Component       | Path                                                 | Description            |
| --------------- | ---------------------------------------------------- | ---------------------- |
| AccountDropdown | `src/lib/components/reusable/AccountDropdown.svelte` | User account menu      |
| Navbar          | `src/lib/components/reusable/Navbar.svelte`          | Public navigation      |
| ColorModeToggle | `src/lib/components/reusable/ColorModeToggle.svelte` | Dark/light mode toggle |

### UI Components (shadcn-svelte based)

These components are vendored by shadcn-svelte, and are never meant to be updated manually. Wrap with a new custom components if need to make changes.
Never derive design or code assumptions from these, as these are vendored. Neither change them, nor inspire from them.

| Component    | Path                                   | Status      |
| ------------ | -------------------------------------- | ----------- |
| Button       | `src/lib/components/ui/button/`        | Implemented |
| Collapsible  | `src/lib/components/ui/collapsible/`   | Implemented |
| Switch       | `src/lib/components/ui/switch/`        | Implemented |
| Tooltip      | `src/lib/components/ui/tooltip/`       | Implemented |
| Progress     | `src/lib/components/ui/progress/`      | Implemented |
| Popover      | `src/lib/components/ui/popover/`       | Implemented |
| DropdownMenu | `src/lib/components/ui/dropdown-menu/` | Implemented |
| Field        | `src/lib/components/ui/field/`         | Implemented |
| ButtonGroup  | `src/lib/components/ui/button-group/`  | Implemented |
| Spinner      | `src/lib/components/ui/spinner/`       | Implemented |
| Empty        | `src/lib/components/ui/empty/`         | Implemented |
| Separator    | `src/lib/components/ui/separator/`     | Implemented |
| Command      | `src/lib/components/ui/command/`       | Implemented |
| Input        | `src/lib/components/ui/input/`         | Implemented |
| InputGroup   | `src/lib/components/ui/input-group/`   | Implemented |
| ScrollArea   | `src/lib/components/ui/scroll-area/`   | Implemented |

## Svelte 5 Patterns

All components use Svelte 5 runes:

```svelte
<script lang="ts">
interface Props {
  title: string
  count?: number
  class?: ClassValue
}

let { title, count = 0, class: itemClass }: Props = $props()
</script>

<!-- no need to use cn(), svelte flattens class array under the hood -->
<div class={["base-classes", itemClass, condition && "some-conditional-class"]}>
  {title} - {count}
</div>
```

### Props Interface

- Use `interface Props` for type safety
- Use `$props()` for reactivity
- Use `$state()` for local state
- Use `$derived()` for computed values

## Styling

### TailwindCSS v4

- No `tailwind.config.js` - config in CSS
- Use `@theme` directive for custom values
- No need to use `cn()` for class merging

## Common UI Patterns

### With Svelte:Boundary

```svelte
<svelte:boundary>
  {#await someAsyncOperation()}
    {@const data = await}
    <!-- success -->
  {:snippet pending()}
    <Spinner />
  {:snippet failed(error)}
    <p class="text-destructive">{error.message}</p>
  {/await}
</svelte:boundary>
```

### With Forms

```svelte
<form method="POST" use:enhance>
  <Field>
    <FieldLabel>Name</FieldLabel>
    <Input name="name" />
    <FieldError name="name" />
  </Field>
  <Button type="submit">Submit</Button>
</form>
```

## Debug Components

- `FormDebug.svelte` - Debug form state (development only)

## Related Files

- `src/app.css` - Global styles and TailwindCSS config
- `src/lib/components/ui/*` - UI component library
- `src/lib/components/dashboard/*` - Dashboard components
- `src/lib/components/reusable/*` - Reusable components
