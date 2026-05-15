import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface FileUploadProps {
  fileType: 'background' | 'music' | 'sfx';
  onUploadSuccess?: (url: string, key: string) => void;
  accept?: string;
  label?: string;
}

export function FileUpload({
  fileType,
  onUploadSuccess,
  accept = '*/*',
  label = 'Upload File',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = trpc.files.upload.useMutation();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('File size must be less than 100MB');
      setSelectedFile(null);
      return;
    }

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = (e.target?.result as string).split(',')[1];

        try {
          const result = await uploadMutation.mutateAsync({
            fileName: file.name,
            fileType,
            mimeType: file.type,
            fileSize: file.size,
            base64Data,
          });

          toast.success('File uploaded successfully');
          onUploadSuccess?.(result.url, result.key);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          console.error('Upload error:', error);
          toast.error('Failed to upload file');
          setSelectedFile(null);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File read error:', error);
      toast.error('Failed to read file');
      setSelectedFile(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative w-full p-8 border-2 border-dashed rounded-lg cursor-pointer
          transition-all duration-200
          ${isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
          }
          ${selectedFile ? 'bg-green-50 dark:bg-green-950 border-green-300' : ''}
        `}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Uploading...
              </p>
            </>
          ) : selectedFile ? (
            <>
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <X className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Drag and drop or click to select
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {selectedFile && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          className="mt-2 text-xs"
        >
          Clear Selection
        </Button>
      )}
    </div>
  );
}
