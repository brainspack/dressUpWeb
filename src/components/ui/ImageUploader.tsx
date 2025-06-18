import React, { useRef, useState } from 'react';
import { CloudUpload } from 'lucide-react';
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
  ...props
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>(initialUrls);

  const handleDivClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (onFilesChange) {
      onFilesChange(files);
    }

    if (onUploadSuccess) {
      // Convert FileList to array of URLs
      const urls = Array.from(files).map(file => URL.createObjectURL(file));
      setSelectedFiles(urls);
      onUploadSuccess(urls);
    }
  };

  // Update selectedFiles when initialUrls change
  React.useEffect(() => {
    if (initialUrls.length > 0) {
      setSelectedFiles(initialUrls);
    }
  }, [initialUrls]);

  return (
    <div className={cn("relative border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-blue-500 transition-colors", className)} onClick={handleDivClick}>
      <Input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple={multiple}
        {...props}
      />
      <div className="flex flex-col items-center justify-center">
        <CloudUpload className="w-10 h-10 text-gray-400 mb-2" />
        <p className="text-gray-600 font-semibold">{uploadText}</p>
        {(selectedFiles.length > 0 || existingImageUrls.length > 0) && (
          <div className="mt-2 text-sm text-gray-700">
            {[...selectedFiles, ...existingImageUrls].map((url, index) => (
              <p key={index} className="truncate max-w-[200px]">{url}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader; 