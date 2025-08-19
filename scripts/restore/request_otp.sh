#!/bin/bash
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/OTP/Send" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "Source": "'"$OTP_SOURCE_TYPE"'",
    "OtpGenerationMode": "'"$OTP_GEN_MODE"'",
    "Type": "'"$OTP_TYPE"'"
  }')

HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
JSON_BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_STATUS" -ne 200 ]; then
  echo "::error ::OTP request failed ($HTTP_STATUS): $(echo "$JSON_BODY" | jq -r '.message')"
  exit 1
fi

UNIQUE_KEY=$(echo "$JSON_BODY" | jq -r '.data.uniqueKey')
CREATED_AT=$(echo "$JSON_BODY" | jq -r '.data.createdAt')
EXPIRES_AT=$(echo "$JSON_BODY" | jq -r '.data.expiresAt')

ENCODED_UNIQUE_KEY=$(echo "$UNIQUE_KEY" | jq -sRr @uri)
ENCODED_CREATED_AT=$(echo "$CREATED_AT" | jq -sRr @uri)
ENCODED_EXPIRES_AT=$(echo "$EXPIRES_AT" | jq -sRr @uri)

echo "UNIQUE_KEY=$UNIQUE_KEY" >> "$GITHUB_ENV"
echo "CREATED_AT=$CREATED_AT" >> "$GITHUB_ENV"
echo "EXPIRES_AT=$EXPIRES_AT" >> "$GITHUB_ENV"

ENCODED_QUERY_PARAMS="createdAt=$ENCODED_CREATED_AT&expiresAt=$ENCODED_EXPIRES_AT&uniqueKey=$ENCODED_UNIQUE_KEY&source=FileDownload"


echo "The OTP code has been sent to your email address. Please enter the OTP with the reference code $UNIQUE_KEY at $MGMT_BASE_URL/git-security/?$ENCODED_QUERY_PARAMS"
