#!/bin/bash
openssl enc -d -aes-256-cbc -pbkdf2 -in $ENC_ARCHIVE_FILE -out $COMPRESSED_ARCHIVE_FILE -pass pass:"$ENCRYPTION_PASSWORD"