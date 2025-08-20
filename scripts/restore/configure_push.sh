#!/bin/bash
set -e
cd repo-mirror

TOKEN_TO_USE=${REPOSITORY_RESTORATION_TOKEN:-$GITHUB_DEFAULT_TOKEN}

git config user.name "$GIT_USER_NAME"
git config user.email "$GIT_USER_EMAIL"
git push --mirror --force "https://x-access-token:$TOKEN_TO_USE@github.com/$GITHUB_REPOSITORY.git"

echo "::notice title=Success!::Repository restored successfully"
