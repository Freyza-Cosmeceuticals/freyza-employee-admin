#!/bin/bash

# This script tells vercel to allow builds only if
# 1. Branch is preview (both preview and production envs)
# 2. Branch is main (only production env)
# 3. Is a PR to preview (only preview env)
# Ignore otherwise

echo "VERCEL_ENV: $VERCEL_ENV"
echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"
echo "VERCEL_GIT_PULL_REQUEST_ID: $VERCEL_GIT_PULL_REQUEST_ID"

# build from preview branch
if [[ "$VERCEL_GIT_COMMIT_REF" == "preview" ]]; then
  echo "Confirming build: Preview branch detected."
  exit 1;
fi

# Always build the main branch in production
if [[ "$VERCEL_GIT_COMMIT_REF" == "main" && "$VERCEL_ENV" == "production" ]]; then
  echo "Confirming build: Production branch detected."
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

echo "Cancelling build: Did not match any build criteria."
exit 0;
