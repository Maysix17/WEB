import React, { useState } from "react";
import { PhotoIcon } from '@heroicons/react/24/outline';
import type { ImageUploadProps } from "../../types/imagen.types";

const ImageUpload: React.FC<ImageUploadProps> = ({ onFileSelect }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500">
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
        className="hidden" 
        id="fileInput" 
      />
      <label htmlFor="fileInput" className="flex flex-col items-center space-y-2">
        {preview ? (
          <img 
            src={preview} 
            alt="Preview" 
            className="w-32 h-32 object-cover rounded-lg" 
          />
        ) : (
          <>
            <PhotoIcon className="w-12 h-12 text-gray-500" />
            <span className="text-gray-500">Suelta aquí la imagen o haz clic</span>
          </>
        )}
      </label>
    </div>
  );
};

export default ImageUpload;



