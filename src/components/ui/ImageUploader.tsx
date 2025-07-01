import React, { useRef, useState } from 'react';
import { CloudUpload, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Input } from './input'; // Assuming Input component is available in the same directory

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

  // Remove image by index
  const handleRemoveImage = (idx: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(idx, 1);
    setSelectedFiles(newFiles);
    if (onUploadSuccess) onUploadSuccess(newFiles);
    if (onFilesChange) {
      // Notifies parent to update form state
      // You may want to pass a FileList-like object or just update the URLs in parent
      // Here, we just update URLs
    }
  };

  const handleDivClick = () => {
    if (selectedFiles.length < maxFiles) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    let urls = Array.from(files).map(file => URL.createObjectURL(file));
    let newFiles = [...selectedFiles, ...urls].slice(0, maxFiles);

    setSelectedFiles(newFiles);
    if (onUploadSuccess) onUploadSuccess(newFiles);
    if (onFilesChange) onFilesChange(files);

    // Reset the file input so the same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  React.useEffect(() => {
    if (initialUrls.length > 0) {
      setSelectedFiles(initialUrls);
    }
  }, [initialUrls]);

  return (
    <div
      className={cn(
        "relative border-2 border-dashed border-gray-300 rounded-md p-2 text-center cursor-pointer hover:border-blue-500 transition-colors w-[120px] h-[120px] flex flex-col items-center justify-center",
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
        disabled={selectedFiles.length >= maxFiles}
        {...props}
      />
      <div className="flex flex-col items-center justify-center">
        <CloudUpload className="w-7 h-7 text-gray-400 mb-1" />
        <p className="text-gray-600 font-semibold text-xs">{uploadText}</p>
       
      </div>
    </div>
  );
};

export default ImageUploader; 