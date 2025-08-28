#!/bin/bash

case "$RUNNER_OS" in
  "Linux")
    API_OS_NAME="Linux"
    ;;
  "Windows")
    API_OS_NAME="Windows"
    ;;
  "macOS")
    API_OS_NAME="MacOS"
    ;;
  *)
    API_OS_NAME="Linux"
    echo "::warning ::Unexpected runner OS '$RUNNER_OS'. Defaulting to 'Linux'."
    ;;
esac

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/endpoint/activation" \
  -H "Content-Type: application/json" \
  -d '{
    "activationCode": "'"$ICREDIBLE_ACTIVATION_CODE"'",
    "uniqueId": "'"$GITHUB_REPOSITORY_ID"'",
    "ip": "'"$RUNNER_IP"'",
    "operatingSystem": "'"$API_OS_NAME"'",
    "endpointType": "'"$ENDPOINT_TYPE"'",
    "endpointName": "'"$ENDPOINT_NAME"'"
  }')

HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
JSON_BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_STATUS" -ne 200 ]; then
  echo "::error ::Activation failed: $JSON_BODY"
  exit 1
fi

echo "endpointId=$(echo "$JSON_BODY" | jq -r '.data.endpointId')" >> $GITHUB_ENV
echo "TOKEN=$(echo "$JSON_BODY" | jq -r '.data.token')" >> $GITHUB_ENV