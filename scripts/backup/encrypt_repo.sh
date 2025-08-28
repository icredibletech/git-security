#!/bin/bash
REPO_NAME=$(basename "$GITHUB_REPOSITORY")
ENC_FILE_NAME="$REPO_NAME.tar.zst.enc"
HASHED_PASSWORD=$(echo -n "$ICREDIBLE_ENCRYPTION_PASSWORD" | openssl dgst -sha256 | awk '{print $2}')
openssl enc -$ENCRYPTION_ALGORITHM -in $COMPRESSED_ARCHIVE_FILE -out "$ENC_FILE_NAME" -pass pass:"$HASHED_PASSWORD"
echo "ENC_FILE_NAME=$ENC_FILE_NAME" >> $GITHUB_ENV
echo "COMPRESSED_SIZE=$(stat --printf='%s' "$ENC_FILE_NAME")" >> $GITHUB_ENV
