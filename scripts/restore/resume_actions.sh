#!/bin/bash
set -e

echo "Restoring original repository settings..."

if [! -f $ACTIONS_PERMISSIONS_FILE_PATH ]; then
  echo "Warning: Original permissions file not found. Re-enabling Actions with default settings."
  gh api \
    --method PUT \
    repos/$GITHUB_REPOSITORY/actions/permissions \
    -F 'enabled=true'
else
  gh api \
    --method PUT \
    repos/$GITHUB_REPOSITORY/actions/permissions \
    --input $ACTIONS_PERMISSIONS_FILE_PATH
fi
