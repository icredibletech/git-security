#!/bin/bash
end_time=$(date -d "$EXPIRES_AT" +%s)

while [ $(date +%s) -lt $end_time ]; do
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/OTP/GetOTPStatus" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"uniqueKey": "'"$UNIQUE_KEY"'"}')
  
  HTTP_STATUS=$(echo -n "$RESPONSE" | tail -n1)
  JSON_BODY=$(echo -n "$RESPONSE" | head -n -1)

  if [ "$HTTP_STATUS" -eq 200 ] && [ "$(echo "$JSON_BODY" | jq -r '.data')" == "true" ]; then
    echo "OTP verified successfully"
    exit 0
  fi
  
  sleep 5
done

echo "::error ::OTP verification timed out"
exit 1