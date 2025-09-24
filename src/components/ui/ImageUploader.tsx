import React, { useRef, useState } from 'react';
import { CloudUpload, X, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Input } from './input';
import { BackendUploadService } from '../../services/backendUploadService';

interface ImageUploaderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  onUploadSuccess?: (urls: string[]) => void;
  onFilesChange?: (files: FileList | undefined) => void;
  initialUrls?: string[];
  existingImageUrls?: string[];
  className?: string;
  uploadText?: string; // New prop for customizable upload text
  maxFiles?: number; // NEW
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  onUploadSuccess,
  onFilesChange,
  initialUrls = [],
  existingImageUrls = [],
  className,
  multiple,
  uploadText = "UPLOAD ...", // Default value
  maxFiles = 2, // Default to 2
  ...props
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>(initialUrls);
  const [isUploading, setIsUploading] = useState(false);

  // Remove image by index
  const handleRemoveImage = (idx: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(idx, 1);
    setSelectedFiles(newFiles);
    if (onUploadSuccess) onUploadSuccess(newFiles);
  };

  const handleDivClick = () => {
    if (selectedFiles.length < maxFiles && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || isUploading) return;

    setIsUploading(true);

    try {
      // Convert FileList to Array
      const fileArray = Array.from(files);
      
      // Check if we can add these files without exceeding maxFiles
      const totalFiles = selectedFiles.length + fileArray.length;
      if (totalFiles > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Upload files through backend (no direct S3 PUT requests)
      const uploadResults = await BackendUploadService.uploadMultipleFilesThroughBackend(fileArray);
      
      // Filter successful uploads and get their view URLs
      const successfulUploads = uploadResults
        .filter(result => result.success && result.viewUrl)
        .map(result => result.viewUrl!);

      if (successfulUploads.length === 0) {
        alert('Failed to upload images. Please try again.');
        return;
      }

      // Update state with S3 URLs
      const newFiles = [...selectedFiles, ...successfulUploads].slice(0, maxFiles);
      setSelectedFiles(newFiles);
      
      if (onUploadSuccess) onUploadSuccess(newFiles);
      if (onFilesChange) onFilesChange(files);

      console.log('✅ Images uploaded to S3:', successfulUploads);

    } catch (error) {
      console.error('❌ Upload error:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
      
      // Reset the file input so the same file can be uploaded again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  React.useEffect(() => {
    if (initialUrls.length > 0) {
      setSelectedFiles(initialUrls);
    }
  }, [initialUrls]);

  return (
    <div className="space-y-2">
      {/* Upload button */}
      {selectedFiles.length < maxFiles && (
        <div
          className={cn(
            "relative border-2 border-dashed border-gray-300 rounded-md p-2 text-center cursor-pointer hover:border-blue-500 transition-colors w-[120px] h-[120px] flex flex-col items-center justify-center",
            isUploading && "opacity-50 cursor-not-allowed",
            className
          )}
          onClick={handleDivClick}
        >
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple={multiple}
            disabled={selectedFiles.length >= maxFiles || isUploading}
            {...props}
          />
          <div className="flex flex-col items-center justify-center">
            {isUploading ? (
              <Loader2 className="w-7 h-7 text-blue-500 mb-1 animate-spin" />
            ) : (
              <CloudUpload className="w-7 h-7 text-gray-400 mb-1" />
            )}
            <p className="text-gray-600 font-semibold text-xs">
              {isUploading ? 'Uploading...' : uploadText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 