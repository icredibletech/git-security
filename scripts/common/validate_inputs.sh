#!/bin/bash

if [ "${#ICREDIBLE_ENCRYPTION_PASSWORD}" -lt 32 ]; then
  echo "::error ::Encryption password must be at least 32 characters (got ${#ICREDIBLE_ENCRYPTION_PASSWORD})"
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



