#!/bin/bash

if [ "${#ICREDIBLE_ENCRYPTION_PASSWORD}" -lt 8 ]; then
  echo "::error ::Encryption password must be at least 8 characters (got ${#ICREDIBLE_ENCRYPTION_PASSWORD})"
  exit 1
fi

if ! echo "$ICREDIBLE_ENCRYPTION_PASSWORD" | grep -q '[A-Z]'; then
  echo "::error ::Encryption password must contain at least one uppercase letter"
  exit 1
fi

if ! echo "$ICREDIBLE_ENCRYPTION_PASSWORD" | grep -q '[a-z]'; then
  echo "::error ::Encryption password must contain at least one lowercase letter"
  exit 1
fi

if ! echo "$ICREDIBLE_ENCRYPTION_PASSWORD" | grep -q '[0-9]'; then
  echo "::error ::Encryption password must contain at least one digit"
  exit 1
fi

if ! echo "$ICREDIBLE_ENCRYPTION_PASSWORD" | grep -q '[!@#$%^&*(),.?":{}|<>]'; then
  echo "::error ::Encryption password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)"
  exit 1
fi

if [[ "$ACTION" != "backup" && "$ACTION" != "restore" ]]; then
  echo "::error ::Invalid action type. Must be 'backup' or 'restore'"
  exit 1
fi
if [[ "$OTP_DELIVERY_METHOD" != "MAIL" && "$OTP_DELIVERY_METHOD" != "AUTHENTICATOR" ]]; then
  echo "::error ::Invalid otp_request_type. Must be 'MAIL' or 'AUTHENTICATOR'"
  exit 1
fi

if [[ "$ACTION" == "restore"  && -z "$FILE_VERSION_ID"  ]]; then
  echo "::error ::Input 'file_version_id' is required when action is 'restore'."
  exit 1
fi

if [[ "$ACTION" == "restore"  && -z "$SUSPEND_ACTIONS"  ]]; then
  echo "::error ::Input 'suspend_actions' is required when action is 'restore'."
  exit 1
fi

if [[ "$ACTION" == "restore"  && "$SUSPEND_ACTIONS" != 'true' && "$SUSPEND_ACTIONS" != 'false' ]]; then
  echo "::error ::Invalid suspend actions. Must be 'true' or 'false'"
  exit 1
fi



