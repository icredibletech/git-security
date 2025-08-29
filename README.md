# Overview

iCredible Github Security is an enterprise-level solution for secure repository backup and restore, featuring robust encryption and compression standards.

## 📋 Requirements

To use this action, you must meet the following requirements.

### GitHub Secrets
> (Required)

You must store the necessary sensitive data in your repository's **Settings > Secrets > Actions** section.
   -  **ICREDIBLE_ACTIVATION_CODE:** The activation code provided by your API service.
   -  **ICREDIBLE_ENCRYPTION_PASSWORD:** A secure password of at least 8 characters that must include: uppercase letter, lowercase letter, digit, and special character (!@#$%^&*(),.?":{}|<>). For stronger security, use at least 32 characters.

### Personal Access Token
> (Optional)

This step is required if you want to restore the .github/workflows directory in your repository. This step is required if you want to restore the .github/workflows directory in your repository. If this token is not provided, the relevant directory within the backup file to be restored is deleted and the information is restored. Since this information is stored in the iCredible File Security, you can restore the github/workflows directory at any time.
   - **ICREDIBLE_REPOSITORY_RESTORE_TOKEN:** A Personal Access Token (PAT) with repo and workflow permissions.
    - **Usage:** Used only during the restore operation to also recover workflow files.

### Workflow Files
> (Required)

   - **For backup:** You can create a file named icredible-git-sec-backup.yml.
   - **For restore:** You can create a file named icredible-git-sec-restore.yml.


## Features
- 🔒 AES-256-CBC encryption with PBKDF2 key derivation
- ⚡ Zstandard (ZSTD) compression at level 9
- 🔐 OTP-based authentication for restore operations
- 📦 Complete repository mirroring with workflow management
- 🔄 Seamless integration with GitHub Actions

---

# ⚙️ Core Technologies

## Encryption & Compression
- **OpenSSL:** Industry-standard encryption using AES-256-CBC cipher with PBKDF2 key derivation.
- **Zstandard:** Real-time compression algorithm providing high compression ratios at level 9.
- **Minimum 32-character keys:** Enforced password strength requirements.

## Security Features
- **OTP Verification:** Dual authentication method (email or authenticator app).
- **Secrets Management:** Secure handling of sensitive data through GitHub Secrets.
- **Encrypted Backups:** All backups are encrypted before transmission and storage.

---

# ⚠️ Important Version Compatibility Notice

## 🔄 Version-Specific Backup & Restore Requirements

**CRITICAL**: To ensure successful restoration of your backups, it is strongly recommended to use the exact same version of iCredible Git Security Action for both backup and restore operations.

## 🔧 Technical Rationale

Different versions may utilize:
- **Varying encryption algorithms** (AES-256-CBC, ChaCha20, etc.)
- **Different compression technologies** (ZSTD levels, alternative compressors)
- **Modified archive formats** and directory structures
- **Updated security protocols** and key derivation functions
- **Changed metadata handling** and verification mechanisms

---

# 📦 Setup Guide

## Intro

1. **Store your Activation Code** as a GitHub Secret  
   - Go to **Settings > Secrets > Actions** in your repository  
   - Create a new secret named `ICREDIBLE_ACTIVATION_CODE`  
   - Paste in the activation code provided by your API service

2. **Store your Encryption PASSWORD** as a GitHub Secret  
   - Create a new secret named `ICREDIBLE_ENCRYPTION_PASSWORD`  
   - Use a strong password of at least 8 characters that includes:
     - Uppercase letter (A-Z)
     - Lowercase letter (a-z)
     - Digit (0-9)
     - Special character (!@#$%^&*(),.?":{}|<>).


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
         uses: icredibletech/git-security@latest
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
        description: 'The version id of the file you want to restore.'
        required: true
      otp_delivery_method:
        description: "Specifies the delivery method for the OTP required to authorize a restore operation. Valid options are 'MAIL' or 'AUTHENTICATOR'."
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
         uses: icredibletech/git-security@latest
         with:
            icredible_activation_code: ${{ secrets.ICREDIBLE_ACTIVATION_CODE }}
            icredible_encryption_password: ${{ secrets.ICREDIBLE_ENCRYPTION_PASSWORD }}
            file_version_id: ${{ github.event.inputs.FILE_VERSION_ID }}
            otp_delivery_method: ${{ github.event.inputs.OTP_DELIVERY_METHOD }}
            suspend_actions: 'true'
            action: 'restore'

```
# 🔑 Personal Access Token (PAT) Setup Guide for Repository Restore

## Create a Personal Access Token
1. Log in to your GitHub account
2. Click on your profile picture in the top-right corner
3. Navigate to: Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
4. Click `Generate new token` then `Generate new token (classic)`

## Configure Token Permissions
Set these required permissions:
```yml
Note: "iCredible-Git-Security-Restore-Token"  # Example name
Expiration: 30 days                           # Recommended duration
Permissions:
- repo       # Select ALL repository permissions
- workflow   # Required for workflow restore
```

## Add Token to Repository Secrets
1. In your repository, go to: Settings → Secrets → Actions
2. Click New repository secret`
3. Enter details:

```bash
Name: ICREDIBLE_REPOSITORY_RESTORE_TOKEN  # This will be used in workflow
Secret: [Paste your generated token here]
```
## Configure Workflow File

Add this to your restore workflow (.github/workflows/icredible-git-sec-restore.yml):

```yaml
icredible_repository_restore_token: ${{ secrets.ICREDIBLE_REPOSITORY_RESTORE_TOKEN }} 
```

# ⚙️ Suspend Workflows During Restore
> Optional

To ensure that the restore process runs without any interference from other automated workflows in your repository, this action includes a safety feature to temporarily suspend all GitHub Actions.

This is highly recommended for repositories with active CI/CD pipelines or other automations.

## How It Works
  - **Before Restore:** The action saves your repository's current workflow settings.
  - **Suspend:** It then temporarily disables GitHub Actions for the entire repository.
  - **After Restore:** Once the restore is complete (or if it fails), the action automatically restores the original workflow settings, re-enabling them.

## Configuration

You can control this feature using the suspend_actions input in your restore workflow file.
  - **suspend_actions: 'true' (Default):** Activates the safety feature. Workflows will be suspend during the operation.
  - **suspend_actions: 'false':** Deactivates the feature. Workflows will remain active, which is not recommended unless you are sure no other actions will interfere.