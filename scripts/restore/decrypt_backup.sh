#!/bin/bash
HASHED_PASSWORD=$(echo -n "$ICREDIBLE_ENCRYPTION_PASSWORD" | openssl dgst -sha256 | awk '{print $2}')
openssl enc -$ENCRYPTION_ALGORITHM -in $ENC_ARCHIVE_FILE -out $COMPRESSED_ARCHIVE_FILE -pass pass:"$HASHED_PASSWORD"