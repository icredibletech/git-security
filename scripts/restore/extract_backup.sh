#!/bin/bash
zstd -d repo.tar.zst -o repo.tar
tar -xf repo.tar
rm repo.tar repo.tar.zst repo.tar.zst.enc