#!/bin/bash
set -e

echo "Reading current repository settings before suspension..."

gh api repos/$GITHUB_REPOSITORY/actions/permissions --jq '.' > $ACTIONS_PERMISSIONS_FILE_PATH

gh api \
  --method PUT \
  repos/$GITHUB_REPOSITORY/actions/permissions \
  -F 'enabled=false'
