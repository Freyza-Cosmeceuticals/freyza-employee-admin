#!/usr/bin/env bash

# Get all UI component directories, excluding "map"
components=$(ls src/lib/components/ui/ | grep -v "^map$")

# Update all standard shadcn-svelte components
bunx --bun shadcn-svelte@latest add $components

# Update map separately using the custom registry URL
bunx --bun shadcn-svelte@latest add https://mapcn-svelte.dev/r/map.json
