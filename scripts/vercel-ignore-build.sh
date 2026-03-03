#!/bin/bash

# This script tells vercel to allow builds only if
# 1. Branch is preview
# 2. Branch is main
# 3. Is a PR to preview
# Ignore otherwise

echo "VERCEL_ENV: $VERCEL_ENV"
echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"
echo "VERCEL_GIT_PULL_REQUEST_ID: $VERCEL_GIT_PULL_REQUEST_ID"

# Always build the main or preview branch
if [[ "$VERCEL_GIT_COMMIT_REF" == "main" || "$VERCEL_GIT_COMMIT_REF" == "preview" ]]; then
  echo "Confirming build: Production/Preview branch detected."
  exit 1;
fi

# Only build other branches if they are part of a Pull Request
if [[ -n "$VERCEL_GIT_PULL_REQUEST_ID" ]]; then
  echo "Confirming build: Pull Request detected (#$VERCEL_GIT_PULL_REQUEST_ID)."
  exit 1;
else
  echo "Cancelling build: Not a PR or a protected branch."
  exit 0;
fi
