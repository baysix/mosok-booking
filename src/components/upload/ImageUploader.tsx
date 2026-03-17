'use client';

import { useState, useRef } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({ images, onChange, maxImages = 5 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      alert(`최대 ${maxImages}장까지 업로드 가능합니다`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);
    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of filesToUpload) {
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name}: 파일 크기는 5MB 이하여야 합니다`);
          continue;
        }

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          alert(`${file.name}: JPG, PNG, WebP만 업로드 가능합니다`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        } else {
          const data = await response.json();
          alert(data.error || '업로드에 실패했습니다');
        }
      }

      if (uploadedUrls.length > 0) {
        onChange([...images, ...uploadedUrls]);
      }
    } catch {
      alert('업로드 중 오류가 발생했습니다');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5">
        프로필 이미지 (최대 {maxImages}장)
      </label>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {/* Existing images */}
        {images.map((url, index) => (
          <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
            <img
              src={url}
              alt={`이미지 ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {index === 0 && (
              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-primary text-white text-[10px] font-bold rounded-md">
                대표
              </span>
            )}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {/* Upload button */}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <ImagePlus className="w-6 h-6" />
                <span className="text-[10px] font-medium">추가</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-[11px] text-gray-400 mt-2">
        JPG, PNG, WebP · 최대 5MB · 첫 번째 이미지가 대표 이미지로 표시됩니다
      </p>
    </div>
  );
}
