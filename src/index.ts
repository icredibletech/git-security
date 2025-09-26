#!/usr/bin/env node

import * as core from '@actions/core';
import { ServiceContainer } from './services/container/service-container';

async function run(): Promise<void> {
  const container = new ServiceContainer();
  const logger = container.getLogger();
  
  try {
    logger.info('🛡️ iCredible Git Security v2.0 - Starting...');
    
    // Initialize services
    await container.initializeServices();
    
    // Validate configuration and mask secrets
    await container.validateConfiguration();
    container.maskSecrets();
    
    // Get configuration
    const configService = container.getConfigService();
    const config = configService.getConfig();
    
    logger.info(`Action type: ${config.inputs.action}`);
    logger.info(`Repository: ${process.env.GITHUB_REPOSITORY}`);
    
    // Execute the appropriate workflow
    if (config.inputs.action === 'backup') {
      logger.info('Executing backup workflow...');
      
      const backupWorkflow = container.getBackupWorkflowService();
      await backupWorkflow.initialize();
      
      const result = await backupWorkflow.execute();
      
      if (!result.success) {
        core.setFailed(result.message);
        return;
      }
      
      // Set outputs for backup
      core.setOutput('record_id', result.recordId || '');
      core.setOutput('directory_record_id', result.directoryRecordId || '');
      core.setOutput('file_size', result.fileSize?.toString() || '0');
      core.setOutput('compressed_size', result.compressedSize?.toString() || '0');
      core.setOutput('encrypted_size', result.encryptedSize?.toString() || '0');
      
    } else if (config.inputs.action === 'restore') {
      logger.info('Executing restore workflow...');
      
      if (!config.inputs.file_version_id) {
        throw new Error('file_version_id is required for restore operation');
      }
      
      const restoreWorkflow = container.getRestoreWorkflowService(
        config.inputs.icredible_repository_restore_token
      );
      await restoreWorkflow.initialize();
      
      const result = await restoreWorkflow.execute(config.inputs.file_version_id);
      
      if (!result.success) {
        core.setFailed(result.message);
        return;
      }
      
      // Set outputs for restore
      core.setOutput('file_version_id', result.fileVersionId || '');
      core.setOutput('workflows_suspended', result.workflowsSuspended?.toString() || 'false');
      
    } else {
      throw new Error(`Invalid action type: ${config.inputs.action}`);
    }
    
    logger.info('✅ Operation completed successfully');
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Operation failed: ${errorMessage}`, error instanceof Error ? error : undefined);
    core.setFailed(errorMessage);
  } finally {
    // Cleanup
    container.dispose();
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run the action
if (require.main === module) {
  run().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { run };