## Overview

This GitHub Action provides a comprehensive solution for securely backing up and restoring your repositories using military-grade encryption and compression.

# 📋 Requirements

To use this action, you must meet the following requirements.


1. GitHub Secrets (Required)
  You must store the necessary sensitive data in your repository's Settings > Secrets > Actions section.
   -  ICREDIBLE_ACTIVATION_CODE: The activation code provided by your API service.
   -  ICREDIBLE_ENCRYPTION_PASSWORD: A secure password of at least 32 characters used to encrypt your backups.

2. Personal Access Token (Optional)
  This step is required if you want to restore the .github/workflows directory in your repository. This step is required if you want to restore the .github/workflows directory in your repository. If this token is not provided, the relevant directory within the backup file to be restored is deleted and the information is restored. Since this information is stored in the iCredible File Security, you can restore the github/workflows directory at any time.
   - ICREDIBLE_REPOSITORY_RESTORE_TOKEN: A Personal Access Token (PAT) with repo and workflow permissions.
    - Usage: Used only during the restore operation to also recover workflow files.

3. Workflow Files (Required)
   - For backup: You can create a file named icredible-git-sec-backup.yml.
   - For restore: You can create a file named icredible-git-sec-restore.yml.


### Features
- 🔒 AES-256-CBC encryption with PBKDF2 key derivation
- ⚡ Zstandard (ZSTD) compression at level 9
- 🔐 OTP-based authentication for restore operations
- 📦 Complete repository mirroring with workflow management
- 🔄 Seamless integration with GitHub Actions

---

## ⚙️ Core Technologies

### Encryption & Compression
- **OpenSSL:** Industry-standard encryption using AES-256-CBC cipher with PBKDF2 key derivation.
- **Zstandard:** Real-time compression algorithm providing high compression ratios at level 9.
- **Minimum 32-character keys:** Enforced password strength requirements.

### Security Features
- **OTP Verification:** Dual authentication method (email or authenticator app).
- **Secrets Management:** Secure handling of sensitive data through GitHub Secrets.
- **Encrypted Backups:** All backups are encrypted before transmission and storage.

---

# 📦 Setup Guide

1. **Store your Activation Code** as a GitHub Secret  
   - Go to **Settings > Secrets > Actions** in your repository  
   - Create a new secret named `ICREDIBLE_ACTIVATION_CODE`  
   - Paste in the activation code provided by your API service

2. **Store your Encryption PASSWORD** as a GitHub Secret  
   - Create a new secret named `ICREDIBLE_ENCRYPTION_PASSWORD`  
   - Use a strong key of **at least 32 characters**


## 🔄 Backup Workflow

Add your workflow file 
   Create a file at `.github/workflows/icredible-git-sec-backup.yml` and paste in the block below:

```yaml
name: "iCredible Repository Backup Process"

on:
  push:
    
jobs:
   secure_and_archive_repo:
     runs-on: ubuntu-latest
     steps:
       - name: Checkout repository
         uses: actions/checkout@v4
         with:
            fetch-depth: 0
    
       - name: "iCredible Git Sec | Backup"
         uses: berkayy-atas/All-in-One-Repo-Repair-Kit@latest
         with:
            icredible_activation_code: ${{ secrets.ICREDIBLE_ACTIVATION_CODE }}
            icredible_encryption_password: ${{ secrets.ICREDIBLE_ENCRYPTION_PASSWORD }}
            action: 'backup'
```
---


## 🔄 Restore Workflow

> **⚠️ Note**
> This is designed for empty repositories—it will overwrite all history.

Create a file at `.github/workflows/icredible-git-sec-restore.yml` and paste in the block below:

```yaml
name: "iCredible Repository Restore Process"
permissions: write-all

on:
  workflow_dispatch:
    inputs:
      file_version_id:
        description: 'The version id of the file you want to restore. You can enter it in the first or second run while using the workflow. The version id you last entered is always kept and restored when the OTP code arrives.'
        required: true

jobs:
   restore_from_archive:
     runs-on: ubuntu-latest
     steps:
       - name: Checkout repository
         uses: actions/checkout@v4
         with:
            fetch-depth: 0

       - name: "iCredible Git Sec | Restore"
         uses: berkayy-atas/All-in-One-Repo-Repair-Kit@latest
         with:
            icredible_activation_code: ${{ secrets.ICREDIBLE_ACTIVATION_CODE }}
            icredible_encryption_password: ${{ secrets.ICREDIBLE_ENCRYPTION_PASSWORD }}
            file_version_id: ${{ github.event.inputs.FILE_VERSION_ID }}
            pause_actions: 'true'
            action: 'restore'
```
# 🔑 Personal Access Token (PAT) Setup Guide for Repository Restoration

## Step 1: Create a Personal Access Token
1. Log in to your GitHub account
2. Click on your profile picture in the top-right corner
3. Navigate to: Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
4. Click `Generate new token` then `Generate new token (classic)`

## Step 2: Configure Token Permissions
Set these required permissions:
```yml
Note: "iCredible-Git-Security-Restore-Token"  # Example name
Expiration: 30 days                           # Recommended duration
Permissions:
- repo       # Select ALL repository permissions
- workflow   # Required for workflow restoration
```

## Step 3: Add Token to Repository Secrets
1. In your repository, go to: Settings → Secrets → Actions
2. Click New repository secret`
3. Enter details:

```bash
Name: ICREDIBLE_REPOSITORY_RESTORE_TOKEN  # This will be used in workflow
Secret: [Paste your generated token here]
```
## Step 4: Configure Workflow File

Add this to your restore workflow (.github/workflows/icredible-git-sec-restore.yml):

```yaml
icredible_repository_restore_token: ${{ secrets.ICREDIBLE_REPOSITORY_RESTORE_TOKEN }} 
```

# ⚙️ Optional: Pausing Workflows During Restore

To ensure that the restore process runs without any interference from other automated workflows in your repository, this action includes a safety feature to temporarily pause all GitHub Actions.

This is highly recommended for repositories with active CI/CD pipelines or other automations.

# # How It Works
  - Before Restore: The action saves your repository's current workflow settings.
  - Pause: It then temporarily disables GitHub Actions for the entire repository.
  - After Restore: Once the restore is complete (or if it fails), the action automatically restores the original workflow settings, re-enabling them.

# # Configuration

You can control this feature using the pause_actions input in your restore workflow file.
  - pause_actions: 'true' (Default): Activates the safety feature. Workflows will be paused during the operation.
  - pause_actions: 'false': Deactivates the feature. Workflows will remain active, which is not recommended unless you are sure no other actions will interfere.
