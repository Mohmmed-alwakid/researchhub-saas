import { put, del, head } from '@vercel/blob';
import crypto from 'crypto';

interface UploadOptions {
  filename?: string;
  contentType?: string;
  addRandomSuffix?: boolean;
}

interface FileMetadata {
  url: string;
  pathname: string;
  size: number;
  contentType?: string;
  uploadedAt: Date;
}

class CloudStorageService {
  private isConfigured: boolean;

  constructor() {
    // Check if Vercel Blob is configured
    this.isConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
    
    if (!this.isConfigured) {
      console.warn('Cloud storage not configured. BLOB_READ_WRITE_TOKEN missing.');
    }
  }

  /**
   * Upload a file to cloud storage
   */
  async uploadFile(
    data: Buffer | string | Uint8Array,
    options: UploadOptions = {}
  ): Promise<FileMetadata> {
    if (!this.isConfigured) {
      throw new Error('Cloud storage not configured');
    }

    try {
      const { filename, contentType, addRandomSuffix = true } = options;
      
      // Generate a unique filename if not provided
      let finalFilename = filename || `file-${Date.now()}`;
      
      if (addRandomSuffix) {
        const randomSuffix = crypto.randomBytes(8).toString('hex');
        const ext = finalFilename.includes('.') ? 
          finalFilename.split('.').pop() : '';
        const name = finalFilename.includes('.') ? 
          finalFilename.split('.').slice(0, -1).join('.') : finalFilename;
        finalFilename = ext ? `${name}-${randomSuffix}.${ext}` : `${name}-${randomSuffix}`;
      }

      const blob = await put(finalFilename, data, {
        access: 'public',
        contentType: contentType,
      });

      return {
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        contentType: contentType,
        uploadedAt: new Date()
      };
    } catch (error) {
      console.error('Failed to upload file to cloud storage:', error);
      throw new Error('File upload failed');
    }
  }

  /**
   * Upload a recording file
   */
  async uploadRecording(
    data: Buffer,
    studyId: string,
    sessionId: string,
    type: 'screen' | 'audio' | 'webcam' = 'screen'
  ): Promise<FileMetadata> {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `recordings/${studyId}/${sessionId}/${type}-${timestamp}.webm`;
    
    return this.uploadFile(data, {
      filename,
      contentType: type === 'audio' ? 'audio/webm' : 'video/webm',
      addRandomSuffix: false
    });
  }

  /**
   * Upload a study attachment
   */
  async uploadStudyAttachment(
    data: Buffer,
    studyId: string,
    originalFilename: string,
    contentType?: string
  ): Promise<FileMetadata> {
    const timestamp = Date.now();
    const ext = originalFilename.split('.').pop();
    const name = originalFilename.split('.').slice(0, -1).join('.');
    const filename = `studies/${studyId}/attachments/${name}-${timestamp}.${ext}`;
    
    return this.uploadFile(data, {
      filename,
      contentType,
      addRandomSuffix: false
    });
  }

  /**
   * Upload user profile image
   */
  async uploadProfileImage(
    data: Buffer,
    userId: string,
    contentType?: string
  ): Promise<FileMetadata> {
    const ext = contentType?.includes('png') ? 'png' : 'jpg';
    const filename = `profiles/${userId}/avatar.${ext}`;
    
    return this.uploadFile(data, {
      filename,
      contentType,
      addRandomSuffix: false
    });
  }

  /**
   * Delete a file from cloud storage
   */
  async deleteFile(url: string): Promise<boolean> {
    if (!this.isConfigured) {
      console.warn('Cloud storage not configured. Cannot delete file.');
      return false;
    }

    try {
      await del(url);
      console.log(`File deleted successfully: ${url}`);
      return true;
    } catch (error) {
      console.error('Failed to delete file from cloud storage:', error);
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(url: string): Promise<{ size: number; contentType?: string } | null> {
    if (!this.isConfigured) {
      return null;
    }

    try {
      const response = await head(url);
      return {
        size: response.size,
        contentType: response.contentType
      };
    } catch (error) {
      console.error('Failed to get file metadata:', error);
      return null;
    }
  }

  /**
   * Generate a signed URL for temporary access (Vercel Blob files are public by default)
   */
  generateSignedUrl(url: string, expirationHours: number = 1): string {
    // Vercel Blob files are public, but we can add token-based access
    const token = this.generateAccessToken(url, expirationHours);
    return `${url}?token=${token}`;
  }

  /**
   * Generate access token for file access
   */
  private generateAccessToken(url: string, expirationHours: number): string {
    const expirationTime = Date.now() + (expirationHours * 60 * 60 * 1000);
    const payload = JSON.stringify({ url, exp: expirationTime });
    const secret = process.env.JWT_SECRET || 'default-secret';
    
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }
  /**
   * Validate access token
   */
  validateAccessToken(url: string, token: string): boolean {
    try {
      // In a real implementation, you'd decode the token and check expiration
      // For now, this is a simplified validation
      const expectedToken = this.generateAccessToken(url, 1);
      return token === expectedToken;
    } catch {
      return false;
    }
  }

  /**
   * Get storage configuration status
   */
  getStatus(): { configured: boolean; provider: string } {
    return {
      configured: this.isConfigured,
      provider: 'Vercel Blob'
    };
  }

  /**
   * Get storage usage statistics (placeholder for future implementation)
   */
  async getUsageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    recordings: number;
    attachments: number;
  }> {
    // This would require implementing a file tracking system
    return {
      totalFiles: 0,
      totalSize: 0,
      recordings: 0,
      attachments: 0
    };
  }
}

export const cloudStorageService = new CloudStorageService();
export default CloudStorageService;
