#!/bin/bash

if [[ "$OTP_REQUEST_TYPE" != "MAIL" && "$OTP_REQUEST_TYPE" != "AUTHENTICATOR" ]]; then
  echo "::error ::Invalid otp_request_type. Must be 'MAIL' or 'AUTHENTICATOR'"
  exit 1
fi

