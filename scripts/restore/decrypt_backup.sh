#!/bin/bash
openssl enc -d -aes-256-cbc -pbkdf2 -in repo.tar.zst.enc -out repo.tar.zst -pass pass:"$ENCRYPTION_PASSWORD"