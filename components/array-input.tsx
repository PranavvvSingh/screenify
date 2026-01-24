'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface ArrayInputProps {
  value: string[];
  onChange: (items: string[]) => void;
  label: string;
  placeholder?: string;
  minItems?: number;
}

export function ArrayInput({
  value,
  onChange,
  label,
  placeholder = 'Enter item...',
  minItems = 1
}: ArrayInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addItem = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !value.includes(trimmedValue)) {
      onChange([...value, trimmedValue]);
      setInputValue('');
    }
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  const hasMinItems = value.length >= minItems;
  const itemsText = value.length === 1 ? `${value.length} item added` : `${value.length} items added`;

  return (
    <div className="space-y-3">
      {/* Input field with Add button */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
        />
        <button
          type="button"
          onClick={addItem}
          disabled={!inputValue.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Item count and status */}
      {value.length > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span className={hasMinItems ? 'text-green-600' : 'text-gray-500'}>
            {itemsText}
            {!hasMinItems && minItems > 0 && ` (minimum ${minItems} required)`}
          </span>
        </div>
      )}

      {/* List of items */}
      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((item, index) => (
            <li
              key={index}
              className="flex items-start gap-2 p-3 bg-gray-50 rounded-md border border-gray-200"
            >
              <span className="flex-1 text-sm text-gray-700">{item}</span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full p-1 transition-colors"
                aria-label={`Remove item ${index + 1}`}
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Empty state */}
      {value.length === 0 && (
        <div className="text-sm text-gray-500 p-4 border border-dashed border-gray-300 rounded-md text-center">
          No items added yet. Type above and click Add or press Enter.
        </div>
      )}
    </div>
  );
}
