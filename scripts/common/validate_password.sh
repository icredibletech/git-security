#!/bin/bash
if [ "${#ENCRYPTION_PASSWORD}" -lt 32 ]; then
  echo "::error ::Encryption password must be at least 32 characters (got ${#ENCRYPTION_PASSWORD})"
  exit 1
fi