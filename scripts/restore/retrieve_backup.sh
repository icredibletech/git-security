#!/bin/bash
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${API_BASE_URL}/restore/${FILE_VERSION_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "X-Verification-Key: 1" \
  -H "X-Unique-Key: ${UNIQUE_KEY}" \
  -o repo.tar.zst.enc)

HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
JSON_BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_STATUS" -ne 200 ]; then
  echo "::error::Backup file could not be retrieved."
  echo "Error: HTTP $HTTP_STATUS status code received from server."
  echo "Server Response: $JSON_BODY"
  exit 1
fi

echo "::notice title=Backup Successfully Downloaded!::The backup file has been downloaded as ‘repo.tar.zst.enc’."

