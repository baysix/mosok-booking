'use client';

import { useState } from 'react';
import { Specialty } from '@/types/master.types';
import { SPECIALTIES } from '@/constants/regions';
import { X, Plus } from 'lucide-react';

interface SpecialtyPickerProps {
  specialties: Specialty[];
  onChange: (specialties: Specialty[]) => void;
}

export function SpecialtyPicker({ specialties, onChange }: SpecialtyPickerProps) {
  const [customSpecialty, setCustomSpecialty] = useState('');

  const toggleSpecialty = (specialty: Specialty) => {
    if (specialties.includes(specialty)) {
      onChange(specialties.filter((s) => s !== specialty));
    } else {
      onChange([...specialties, specialty]);
    }
  };

  const addCustomSpecialty = () => {
    const trimmed = customSpecialty.trim();
    if (!trimmed || specialties.includes(trimmed)) {
      setCustomSpecialty('');
      return;
    }
    onChange([...specialties, trimmed]);
    setCustomSpecialty('');
  };

  const removeSpecialty = (specialty: string) => {
    onChange(specialties.filter((s) => s !== specialty));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">전문분야</label>
      <div className="flex flex-wrap gap-2">
        {SPECIALTIES.map((s) => {
          const active = specialties.includes(s.value as Specialty);
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => toggleSpecialty(s.value as Specialty)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                active
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* 커스텀 전문분야 입력 */}
      <div className="flex gap-2 mt-3">
        <input
          type="text"
          value={customSpecialty}
          onChange={(e) => setCustomSpecialty(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addCustomSpecialty();
            }
          }}
          placeholder="직접 입력하세요"
          className="flex-1 h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
        />
        <button
          type="button"
          onClick={addCustomSpecialty}
          className="h-10 px-4 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 active:scale-95 transition-all flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          추가
        </button>
      </div>

      {/* 선택된 전문분야 태그 */}
      {specialties.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {specialties.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium border border-indigo-100"
            >
              {s}
              <button
                type="button"
                onClick={() => removeSpecialty(s)}
                className="p-0.5 rounded-full hover:bg-indigo-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
