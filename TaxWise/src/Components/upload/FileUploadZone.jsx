import React, { useRef } from 'react';
import { Upload } from "lucide-react";

export default function FileUploadZone({ onFileSelect, processing }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = React.useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files);
    }
  };

  return (
    <div className="oneui-card p-4">
      <div
        className={`p-8 text-center rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
          dragActive ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 border-gray-300 hover:border-blue-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.csv,.xls,.xlsx"
          onChange={handleFileInput}
          className="hidden"
          disabled={processing}
        />
        
        <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-blue-500" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Drop Files Here
        </h3>
        
        <p className="text-gray-500 mb-4">
          or click to browse
        </p>
        
        <p className="text-xs text-gray-400">
          Supports PDF, Images, CSV, Excel
        </p>
      </div>
    </div>
  );
}