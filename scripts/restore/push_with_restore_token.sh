#!/bin/bash
cd $SOURCE_ARCHIVE_DIR

git config user.name "$GIT_USER_NAME"
git config user.email "$GIT_USER_EMAIL"
git push --mirror --force "https://x-access-token:$RESTORE_TOKEN@github.com/$GITHUB_REPOSITORY.git"

echo "::notice title=Success!::Repository restored successfully"
