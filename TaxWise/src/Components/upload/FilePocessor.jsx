import React from 'react';
import { FileText, Image, Trash2, Loader2, Zap } from "lucide-react";

export default function FileProcessor({ files, onRemoveFile, onProcessFiles, processing }) {
  const getFileIcon = (file) => {
    if (file.type === 'application/pdf') return <FileText className="w-6 h-6 text-red-500" />;
    if (file.type.startsWith('image/')) return <Image className="w-6 h-6 text-blue-500" />;
    return <FileText className="w-6 h-6 text-green-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="oneui-card p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Ready to Process ({files.length})</h3>
      
      <div className="space-y-3 mb-6">
        {files.map((file, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
            <div className="flex items-center gap-3 overflow-hidden">
              {getFileIcon(file)}
              <div className="overflow-hidden">
                <div className="font-semibold text-sm truncate">{file.name}</div>
                <div className="text-xs text-gray-500 font-medium">
                  {formatFileSize(file.size)}
                </div>
              </div>
            </div>
            <button
              onClick={() => onRemoveFile(index)}
              disabled={processing}
              className="p-2 rounded-full hover:bg-red-100 text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onProcessFiles}
        disabled={processing || files.length === 0}
        className="oneui-button w-full flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            Process {files.length} {files.length === 1 ? 'File' : 'Files'}
          </>
        )}
      </button>
    </div>
  );
}