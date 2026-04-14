'use client';

import { useBodyLock } from '@/hooks/useBodyLock';
import DaumPostcodeEmbed, { Address } from 'react-daum-postcode';
import { X } from 'lucide-react';

interface AddressSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: Address) => void;
}

export function AddressSearchModal({ isOpen, onClose, onComplete }: AddressSearchModalProps) {
  useBodyLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-900">주소 검색</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <DaumPostcodeEmbed
          onComplete={onComplete}
          style={{ height: 470 }}
        />
      </div>
    </div>
  );
}
