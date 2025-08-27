#!/bin/bash
set -e

echo "Reading current repository settings before suspension..."

gh api repos/$GITHUB_REPOSITORY/actions/permissions > /tmp/$ACTIONS_PERM

gh api \
  --method PUT \
  repos/$GITHUB_REPOSITORY/actions/permissions \
  -F 'enabled=false'
