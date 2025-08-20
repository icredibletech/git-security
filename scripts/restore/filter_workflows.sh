#!/bin/bash
set -e

sudo apt-get install -y git-filter-repo > /dev/null 2>&1
git filter-repo --force --path .github/workflows --invert-paths
echo "::warning title=Information About The Scope Of Restoration::The repository will be restored without the ./.github/workflow directory. If you want to restore this directory, you can find the relevant steps at the following link: https://github.com/berkayy-atas/All-in-One-Repo-Repair-Kit?tab=readme-ov-file#step-1-create-a-personal-access-token"
