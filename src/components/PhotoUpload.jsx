import React, { useState, useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { base44 } from '../api/base44Client';

const PhotoUpload = ({ onUploadSuccess, onUploadError }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Quick preview
    setPreview(URL.createObjectURL(file));

    setIsUploading(true);
    try {
      // Integration
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onUploadSuccess(file_url);
    } catch (err) {
      console.error('File upload failed', err);
      if(onUploadError) onUploadError(err);
    } finally {
      setIsUploading(false);
    }
  };

  const clearPhoto = () => {
    setPreview(null);
    onUploadSuccess(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="mt-2">
      {!preview ? (
        <div 
          className="border-2 border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
          <p className="text-sm font-medium text-slate-700">Click to upload photo</p>
          <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="relative inline-block">
          <img src={preview} alt="Upload preview" className="h-48 rounded-lg object-cover" />
          {isUploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
                <span className="text-white text-sm font-medium">Uploading...</span>
            </div>
          )}
          <button
            type="button"
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
            onClick={clearPhoto}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
