#!/bin/bash
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/endpoint/activation" \
  -H "Content-Type: application/json" \
  -d '{
    "activationCode": "'"$ACTIVATION_CODE"'",
    "uniqueId": "'"$GITHUB_REPOSITORY_ID"'",
    "ip": "'"$RUNNER_IP"'",
    "operatingSystem": "Linux",
    "endpointType": "Workstation",
    "endpointName": "Github Endpoint ('"$GITHUB_REPOSITORY"')"
  }')

HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
JSON_BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_STATUS" -ne 200 ]; then
  echo "::error ::Activation failed: $JSON_BODY"
  exit 1
fi

echo "endpointId=$(echo "$JSON_BODY" | jq -r '.data.endpointId')" >> $GITHUB_ENV
echo "TOKEN=$(echo "$JSON_BODY" | jq -r '.data.token')" >> $GITHUB_ENV