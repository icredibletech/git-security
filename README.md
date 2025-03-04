# iCredible File Security Repository Backup & Restore

## Overview
This repository provides an automated backup and restore workflow for GitHub repositories using GitHub Actions. It securely stores repository backups via an API and enables controlled restoration through OTP verification.

## Features
- **Automated Backup:** Runs on each commit push, compressing and encrypting the repository before uploading.
- **Secure Storage:** Uses AES-256 encryption and API-based secure storage.
- **OTP-Based Restore:** Ensures only authorized users can restore backups.
- **Flexible OTP Handling:** Users can request an OTP and then use it in a second attempt to retrieve the backup.
- **Efficient Compression:** Uses ZSTD for optimal storage efficiency.

## Backup Workflow
The backup workflow is triggered on each `push` event and follows these steps:
1. **Checkout Repository** – Clones the repository in mirror mode.
2. **Install ZSTD** – Ensures ZSTD compression is available.
3. **Compress Repository** – Archives and compresses the repository using ZSTD.
4. **Request Activation Token** – Fetches an authentication token from the API.
5. **Upload Backup** – Sends the compressed repository to the API securely.
6. **Store Context Information** – Saves relevant details (TOKEN, FILE_ID, FILE_GUID) for future restores.

## Restore Workflow
The restore workflow is manually triggered via `workflow_dispatch` and follows these steps:
1. **Download Backup Context** – Retrieves saved details from the previous backup.
2. **Check OTP Input** – If an OTP is provided, it proceeds with restoration; otherwise, an OTP request is initiated.
3. **Request Activation Token** – Fetches a new authentication token.
4. **OTP Handling (If Needed)** – If no OTP is provided, one is requested and sent via email.
5. **Retrieve Backup (If OTP Provided)** – Downloads the encrypted backup from the API.
6. **Extract and Restore Backup** – Decompresses and extracts the repository files.
7. **Push to Repository** – Restores the repository content by pushing the extracted data.

## Usage
### Backup Workflow
This workflow is triggered automatically on every commit push.

### Restore Workflow
To restore a backup:
1. Manually trigger the restore workflow (`workflow_dispatch`).
2. Leave the OTP field empty on the first attempt to receive an OTP via email.
3. Re-run the workflow, this time entering the received OTP.
4. The repository will be restored and pushed to the designated branch.

## Requirements
- **GitHub Secrets:**
  - `ICREDIBLE_ACTIVATION_CODE` – Required for authentication.
  - `GITHUB_TOKEN` – Required for pushing restored data. (Provided by GitHub Actions)
- **API Endpoints:**
  - `/endpoint/activation` – For authentication.
  - `/shield` – For backup uploads.
  - `/OTP/Send` – For OTP generation.
  - `/restore/{file_guid}` – For restoring backups.

## Notes
- The backup workflow is fully automated, while restore requires OTP verification.
- Logs and detailed outputs help track the workflow progress.
- Ensure required secrets and API configurations are set up before use.

