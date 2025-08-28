#!/bin/bash
set -e

echo "Restoring original repository settings..."

MAX_RETRIES=3
RETRY_DELAY=5

if [ ! -f $ACTIONS_PERMISSIONS_FILE_PATH ]; then
  echo "Warning: Original permissions file not found. Re-enabling Actions with default settings."
  gh api \
    --method PUT \
    repos/$GITHUB_REPOSITORY/actions/permissions \
    -F 'enabled=true'
else
  original_perms=$(cat $ACTIONS_PERMISSIONS_FILE_PATH)
    gh api \
    --method PUT \
    repos/$GITHUB_REPOSITORY/actions/permissions \
    --input $ACTIONS_PERMISSIONS_FILE_PATH
  
  for attempt in $(seq 1 $MAX_RETRIES); do
    
    current_perms=$(gh api repos/$GITHUB_REPOSITORY/actions/permissions --jq '.')
    
    expected_enabled=$(echo "$original_perms" | jq -r '.enabled')
    expected_allowed_actions=$(echo "$original_perms" | jq -r '.allowed_actions')
    expected_sha_pinning_required=$(echo "$original_perms" | jq -r '.sha_pinning_required')

    current_enabled=$(echo "$current_perms" | jq -r '.enabled')
    current_allowed_actions=$(echo "$current_perms" | jq -r '.allowed_actions')
    current_sha_pinning_required=$(echo "$current_perms" | jq -r '.sha_pinning_required')

    
    if [ "$current_enabled" = "$expected_enabled" ] && \
       [ "$current_allowed_actions" = "$expected_allowed_actions" ] && \
       [ "$current_sha_pinning_required" = "$expected_sha_pinning_required" ]; then
      echo "✓ Permissions successfully restored:"
      echo "  - Enabled: $current_enabled"
      echo "  - Allowed actions: $current_allowed_actions"
      echo "  - Sha pinning required: $current_sha_pinning_required"
      break
    else
      echo "✗ Permissions mismatch detected:"
      echo "  Expected - Enabled: $expected_enabled, Allowed actions: $expected_allowed_actions, Sha pinning required: $expected_sha_pinning_required"
      echo "  Current  - Enabled: $current_enabled, Allowed actions: $current_allowed_actions, Sha pinning required: $current_sha_pinning_required"

      
      if [ $attempt -lt $MAX_RETRIES ]; then
        echo "Retrying in $RETRY_DELAY seconds..."
        sleep $RETRY_DELAY
        
        # try again restore perm
        gh api \
          --method PUT \
          repos/$GITHUB_REPOSITORY/actions/permissions \
          --input $ACTIONS_PERMISSIONS_FILE_PATH
      else
        echo "Error: Failed to restore permissions after $MAX_RETRIES attempts."
        echo "Please check your GitHub token permissions and try again."
        exit 1
      fi
    fi
  done
fi

echo "Repository actions have been successfully resumed."