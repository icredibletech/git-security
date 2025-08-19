#!/bin/bash
cd $SOURCE_ARCHIVE_DIR

sudo apt-get install -y git-filter-repo
git filter-repo --force --path .github/workflows --invert-paths

echo "::warning title=Information About The Scope Of Restoration::The repository will be restored without the ./.github/workflow directory. If you want to restore this directory, you can find the relevant steps at the following link: https://github.com/berkayy-atas/All-in-One-Repo-Repair-Kit?tab=readme-ov-file#step-1-create-a-personal-access-token"


git config user.name "$GIT_USER_NAME"
git config user.email "$GIT_USER_EMAIL"
git push --mirror --force "https://x-access-token:$GITHUB_DEFAULT_TOKEN@github.com/$GITHUB_REPOSITORY.git"

echo "::notice title=Success!::Repository restored successfully"
