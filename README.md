# All-in-One-Repo-Repair-Kit

## Overview

This GitHub Action provides a comprehensive solution for securely backing up and restoring your repositories using military-grade encryption and compression.

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
   - Create a new secret named `ENCRYPTION_PASSWORD`  
   - Use a strong key of **at least 32 characters**


## 🔄 Backup Workflow

Add your workflow file 
   Create a file at `.github/workflows/icredible_repository_shield.yml` and paste in the block below:

```yaml
name: "iCredible Repository Shield Process"

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
    
      - name: "The iCredible shield operation was triggered by ${{ github.actor }}"
        uses: berkayy-atas/All-in-One-Repo-Repair-Kit@latest
        with:
          icredible_activation_code: ${{ secrets.ICREDIBLE_ACTIVATION_CODE }}
          icredible_encryption_password: ${{ secrets.ENCRYPTION_PASSWORD }}
```
---


## 🔄 Restore Workflow

> **⚠️ Note**
> This is designed for empty repositories—it will overwrite all history.

Create a file at `.github/workflows/icredible_repository_restore.yml` and paste in the block below:

```yaml
name: "iCredible Repository Restoration Procedure"
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

      - name: "The iCredible restore operation was triggered by ${{ github.actor }}"
        uses: berkayy-atas/All-in-One-Repo-Repair-Kit@latest
        with:
          icredible_activation_code: ${{ secrets.ICREDIBLE_ACTIVATION_CODE }}
          icredible_encryption_password: ${{ secrets.ENCRYPTION_PASSWORD }}
          file_version_id: ${{ github.event.inputs.FILE_VERSION_ID }}
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
Note: "Repository-Restoration-Token"  # Example name
Expiration: 30 days             # Recommended duration
Permissions:
- repo       # Select ALL repository permissions
- workflow   # Required for workflow restoration
```

## Step 3: Add Token to Repository Secrets
1. In your repository, go to: Settings → Secrets → Actions
2. Click New repository secret`
3. Enter details:

```bash
Name: REPOSITORY_RESTORATION_TOKEN  # This will be used in workflow
Secret: [Paste your generated token here]
```
## Step 4: Configure Workflow File

Add this to your restoration workflow (.github/workflows/restore.yml):

```yaml
repository_restoration_token: ${{ secrets.REPOSITORY_RESTORATION_TOKEN }} 
```


