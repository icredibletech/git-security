#!/bin/bash

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


