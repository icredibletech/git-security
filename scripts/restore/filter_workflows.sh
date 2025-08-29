#!/bin/bash
set -e
cd repo-mirror

sudo apt-get install -y git-filter-repo > /dev/null 2>&1
git filter-repo --force --path .github/workflows --invert-paths
echo "::warning title=Information About The Scope Of Restore::The repository will be restored without the ./.github/workflow directory. If you want to restore this directory, you can find the relevant steps at the following link: https://github.com/marketplace/actions/icredible-git-security#-personal-access-token-pat-setup-guide-for-repository-restore"
