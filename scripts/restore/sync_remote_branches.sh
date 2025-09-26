#!/bin/bash
set -e
cd repo-mirror

for remote_branch in $(git branch -r | grep -v '\->'); do
    # Clean up the branch name (remove origin/ prefix)
    branch_name=${remote_branch#origin/}
    
    if [ "$branch_name" = "main" ]; then
        continue
    fi
    
    # echo "Creating local branch: $branch_name"
    
    if ! git branch --list | grep -q " $branch_name$"; then
        git branch "$branch_name" "$remote_branch"
    else
        echo "Branch $branch_name already exists locally"
    fi
done