#!/bin/bash
tar -cf repo.tar repo-mirror
zstd -$ZSTD_COMPRESSION_LEVEL repo.tar -o repo.tar.zst
echo "UNCOMPRESSED_SIZE=$(stat --printf='%s' repo.tar)" >> $GITHUB_ENV