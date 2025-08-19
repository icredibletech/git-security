#!/bin/bash

set -e

curl_args=(
  -F "MetaData[Event]=$GITHUB_EVENT_NAME"
  -F "MetaData[Ref]=$GITHUB_REF"
  -F "MetaData[Actor]=$GITHUB_ACTOR"
  -F "MetaData[Owner]=${GITHUB_REPOSITORY%/*}"
  -F "MetaData[OwnerType]=$GITHUB_ACTOR"
)

if git rev-parse --verify HEAD &>/dev/null; then
  commit_data=$(git log -1 --pretty="%H|%h|%P|%an <%ae>|%ad|%cn|%s%n%b")
  IFS='|' read -r COMMIT SHORT PARENTS AUTHOR DATE COMMITTER MESSAGE <<< "$commit_data"
  
  curl_args+=(
    -F "MetaData[Commit]=$COMMIT"
    -F "MetaData[CommitShort]=$SHORT"
    -F "MetaData[Author]=$AUTHOR"
    -F "MetaData[Date]=$DATE"
    -F "MetaData[Committer]=$COMMITTER"
    -F "MetaData[Message]=$MESSAGE"
  )
fi


RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    "$API_BASE_URL/backup/shield" \
    -H "Authorization: Bearer $TOKEN" \
    -F "file=@$ENC_FILE_NAME" \
    -F "Size=$UNCOMPRESSED_SIZE" \
    -F "CompressedFileSize=$COMPRESSED_SIZE" \
    -F "Attributes=$UPLOAD_ATTRIBUTES" \
    -F "FileName=${GITHUB_REPOSITORY}" \
    -F "CompressionEngine=$UPLOAD_COMPRESSION_ENGINE" \
    -F "CompressionLevel=$UPLOAD_COMPRESSION_LEVEL" \
    -F "FullPath=/${GITHUB_REPOSITORY}/$ENC_FILE_NAME" \
    -F "encryptionType=$UPLOAD_ENCRYPTION_TYPE" \
    -F "RevisionType=$UPLOAD_REVISION_TYPE" \
    "${curl_args[@]}"
)

HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
JSON_BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_STATUS" -ne 200 ]; then
    echo "::error ::Upload failed: $JSON_BODY"
    exit 1
fi

echo "recordId=$(echo "$JSON_BODY" | jq -r '.data.recordId')" >> "$GITHUB_ENV"
echo "directoryRecordId=$(echo "$JSON_BODY" | jq -r '.data.directoryRecordId')" >> "$GITHUB_ENV"

echo "commit=$COMMIT" >> "$GITHUB_ENV"
echo "commitShort=$SHORT" >> "$GITHUB_ENV"
echo "parents=$PARENTS" >> "$GITHUB_ENV"
echo "author=$AUTHOR" >> "$GITHUB_ENV"
echo "date=$DATE" >> "$GITHUB_ENV"
echo "committer=$COMMITTER" >> "$GITHUB_ENV"
ENCODED_MESSAGE=$(echo -n "$MESSAGE" | base64)
echo "message_b64=$ENCODED_MESSAGE" >> "$GITHUB_ENV"

echo "Backup successfully uploaded. Summary being created..."
