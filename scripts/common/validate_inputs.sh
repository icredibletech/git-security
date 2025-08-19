#!/bin/bash

if [ -z "$ACTIVATION_CODE" ]; then
  echo "::error ::Activation code cannot be left blank"
  exit 1
fi
if [ "${#ENCRYPTION_PASSWORD}" -lt 32 ]; then
  echo "::error ::Encryption password must be at least 32 characters (got ${#ENCRYPTION_PASSWORD})"
  exit 1
fi
if [[ "$ACTION" != "backup" && "$ACTION" != "restore" ]]; then
  echo "::error ::Invalid otp_request_type. Must be 'backup' or 'restore'"
  exit 1
fi
if [[ "$OTP_REQUEST_TYPE" != "MAIL" && "$OTP_REQUEST_TYPE" != "AUTHENTICATOR" ]]; then
  echo "::error ::Invalid otp_request_type. Must be 'MAIL' or 'AUTHENTICATOR'"
  exit 1
fi

if [[ "$ACTION" == "restore" ]]; then
  [ -z "$FILE_VERSION_ID" ] && { echo "::error ::Input 'file_version_id' is required when action is 'restore'."; exit 1; }
fi



