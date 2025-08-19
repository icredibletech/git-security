#!/bin/bash
cd $SOURCE_ARCHIVE_DIR
ls -la
if [ -z "$RESTORE_TOKEN" ]; then
  sudo apt-get install -y git-filter-repo
  git filter-repo --force --path .github/workflows --invert-paths
  TOKEN_TO_USE="$GITHUB_DEFAULT_TOKEN"
  echo "::warning title=Information About The Scope Of Restoration::The repository will be restored without the ./.github/workflow directory. If you want to restore this directory, you can find the relevant steps at the following link: https://github.com/berkayy-atas/All-in-One-Repo-Repair-Kit?tab=readme-ov-file#step-1-create-a-personal-access-token"
else
  TOKEN_TO_USE="$RESTORE_TOKEN"
fi

git config user.name "$GIT_USER_NAME"
git config user.email "$GIT_USER_EMAIL"
git push --mirror --force "https://x-access-token:$TOKEN_TO_USE@github.com/$GITHUB_REPOSITORY.git"

echo "::notice title=Success!::Repository restored successfully"
