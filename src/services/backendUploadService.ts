import { baseApi } from '../api/baseApi';

export interface BackendUploadResult {
  success: boolean;
  fileKey?: string;
  viewUrl?: string;
  publicUrl?: string;
  error?: string;
}

export class BackendUploadService {
  /**
   * Refresh S3 signed URL for viewing images
   */
  static async refreshSignedUrl(fileKey: string): Promise<{ success: boolean; signedUrl?: string; error?: string }> {
    try {
      const response = await baseApi('/orders/signed-url', {
        method: 'POST',
        body: { fileKey },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to refresh URL');
      }

      return {
        success: true,
        signedUrl: response.signedUrl,
      };
    } catch (error) {
      console.error('❌ URL refresh error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown refresh error',
      };
    }
  }

  /**
   * Upload a file through the backend (bypasses CORS issues)
   */
  static async uploadFileThroughBackend(file: File): Promise<BackendUploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Read the same key used on login
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      console.log('🚀 Uploading file through backend:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'No token'
      });

      if (!token) {
        console.error('❌ No authentication token found');
        throw new Error('No authentication token found. Please login again.');
      }

      // Use fetch directly to avoid baseApi's JSON.stringify on FormData
      const response = await fetch('http://localhost:3000/orders/upload-direct', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Client': 'admin-web'
        },
        // Don't set Content-Type header, let browser set it with boundary for FormData
      });

      console.log('📡 Upload response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });

        throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.error || 'Upload failed');
      }

      console.log('✅ File uploaded successfully through backend:', {
        fileName: file.name,
        fileKey: responseData.fileKey,
        viewUrl: responseData.viewUrl?.substring(0, 100) + '...',
      });

      return {
        success: true,
        fileKey: responseData.fileKey,
        viewUrl: responseData.viewUrl,
        publicUrl: responseData.publicUrl,
      };
    } catch (error) {
      console.error('❌ Backend upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown upload error',
      };
    }
  }

  /**
   * Upload multiple files through the backend
   */
  static async uploadMultipleFilesThroughBackend(files: File[]): Promise<BackendUploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFileThroughBackend(file));
    return Promise.all(uploadPromises);
  }
}
