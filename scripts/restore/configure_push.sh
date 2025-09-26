#!/bin/bash
set -e
cd repo-mirror

TOKEN_TO_USE=${ICREDIBLE_REPOSITORY_RESTORE_TOKEN:-$GITHUB_DEFAULT_TOKEN}
REMOTE_URL="https://x-access-token:$TOKEN_TO_USE@github.com/$GITHUB_REPOSITORY.git"

git config user.name "$GIT_USER_NAME"
git config user.email "$GIT_USER_EMAIL"


if [[ "$ICREDIBLE_REPOSITORY_RESTORE_TOKEN" == "" ]]; then
  git push --mirror --force "$REMOTE_URL"
  echo "::notice title=Success!::Repository restored successfully"
  exit 0;
fi

# Push all local branch to remote
for branch in $(git for-each-ref --format='%(refname:short)' refs/heads/); do
    git push "$REMOTE_URL" "$branch" --force
done

git push "$REMOTE_URL" --tags --force

echo "::notice title=Success!::Repository restored successfully"
