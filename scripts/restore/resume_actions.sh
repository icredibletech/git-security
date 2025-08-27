#!/bin/bash
set -e

echo "Restoring original repository settings..."

if [! -f /tmp/$ACTIONS_PERM ]; then
  echo "Warning: Original permissions file not found. Re-enabling Actions with default settings."
  gh api \
    --method PUT \
    repos/$GITHUB_REPOSITORY/actions/permissions \
    -F 'enabled=true'
else
  gh api \
    --method PUT \
    repos/$GITHUB_REPOSITORY/actions/permissions \
    --input /tmp/$ACTIONS_PERM
fi
