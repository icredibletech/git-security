#!/bin/bash
set -e


UPLOAD_METADATA=""
if [ -n "$commit" ]; then
    # decode the Base64-encoded message
    DECODED_MESSAGE=$(echo "$message_b64" | base64 -d)
    UPLOAD_METADATA=$(cat <<EOF
--------------------------------------------------
**Upload Metadata**
- Commit:      $commit
- CommitShort: $commitShort
- Author:      $author
- Date:        $date
- Committer:   $committer
- Message:     $DECODED_MESSAGE
EOF
)
fi


SUMMARY=$(cat <<EOF
✅ **Backup completed successfully!**
--------------------------------------------------
**Git Metadata**
Repository: $GITHUB_REPOSITORY
- Owner: $GITHUB_REPOSITORY_OWNER [$OWNER_TYPE]
- Event: $GITHUB_EVENT_NAME
- Ref:   $GITHUB_REF
- Actor: $GITHUB_ACTOR
$UPLOAD_METADATA
--------------------------------------------------
**API Response**
- File version id: $recordId
- You can access the backed-up file from this link: $MGMT_BASE_URL/dashboard/file-management/$endpointId/$directoryRecordId
EOF
)

MESSAGE="${SUMMARY//'%'/'%25'}"
MESSAGE="${MESSAGE//$'\n'/'%0A'}"
MESSAGE="${MESSAGE//$'\r'/'%0D'}"

echo "::notice title=Backup completed successfully!::$MESSAGE"
