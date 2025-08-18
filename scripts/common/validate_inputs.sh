#!/bin/bash

if [[ "$OTP_DELIVERY_METHOD" != "MAIL" && "$OTP_DELIVERY_METHOD" != "AUTHENTICATOR" ]]; then
  echo "::error ::Invalid otp_request_type. Must be 'MAIL' or 'AUTHENTICATOR'"
  exit 1
fi

