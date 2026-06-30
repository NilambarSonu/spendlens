import React, { useState, useEffect, useRef } from 'react';
import { ToolIcon } from './ToolIcons';
import type { ToolId } from '@/types';

interface SelectOption {
  id: string;
  name: string;
  details?: string;
  iconId?: ToolId;
  disabled?: boolean;
}

interface GlassSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}

export default function GlassSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  className = '',
}: GlassSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset search when opening/closing
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setSearch('');
        setActiveIndex(-1);
      }, 0);
      return () => clearTimeout(timer);
    } else {
      // Focus search input on open
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(search.toLowerCase()) ||
    (opt.details && opt.details.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;
    onChange(option.id);
    setIsOpen(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1 >= filteredOptions.length ? 0 : prev + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 < 0 ? filteredOptions.length - 1 : prev - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
          handleSelect(filteredOptions[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={`relative w-full ${className}`}
    >
      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-[#a8c3de] hover:border-[#533afd] rounded-md px-3.5 py-2.5 text-sm font-medium text-[#0d253d] focus:outline-none focus:ring-2 focus:ring-[#533afd]/10 focus:border-[#533afd] transition-all duration-200 cursor-pointer text-left shadow-sm"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {selectedOption?.iconId && (
            <ToolIcon toolId={selectedOption.iconId} size={18} className="shrink-0" />
          )}
          <span className="truncate font-sans font-medium text-[#0d253d]">
            {selectedOption ? selectedOption.name : placeholder}
          </span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className={`w-4 h-4 text-zinc-400 transition-transform duration-300 shrink-0 ${
            isOpen ? 'rotate-180 text-[#533afd]' : ''
          }`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown Floating Panel */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-[#e3e8ee] rounded-md shadow-[rgba(0,55,112,0.08)_0_8px_24px,rgba(0,55,112,0.04)_0_2px_6px] overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
          {/* Search bar inside Dropdown */}
          <div className="p-2 border-b border-[#e3e8ee] flex items-center gap-2 bg-[#f6f9fc]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-4 h-4 text-zinc-400 shrink-0 ml-1.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-0 outline-none text-xs text-[#0d253d] placeholder-zinc-400 py-1 font-sans"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="p-1 hover:text-[#0d253d] text-zinc-400 transition-colors cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* List Options */}
          <ul className="max-h-[220px] overflow-y-auto py-1 scrollbar-thin scrollbar-zinc">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-xs text-zinc-400 text-center font-sans font-medium">
                No matching results found
              </li>
            ) : (
              filteredOptions.map((option, idx) => {
                const isActive = idx === activeIndex;
                const isSelected = option.id === value;

                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      disabled={option.disabled}
                      onClick={() => handleSelect(option)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left cursor-pointer transition-all duration-200 font-sans ${
                        option.disabled ? 'opacity-40 cursor-not-allowed bg-[#f6f9fc]/50' : ''
                      } ${
                        isSelected
                          ? 'bg-[#e8ebfd] text-[#533afd] font-semibold'
                          : isActive
                          ? 'bg-[#f6f9fc] text-[#0d253d]'
                          : 'hover:bg-[#f6f9fc] text-[#273951]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {option.iconId && (
                          <ToolIcon toolId={option.iconId} size={16} className="shrink-0" />
                        )}
                        <span className="truncate">{option.name}</span>
                      </div>
                      
                      {option.details && (
                        <span className="text-[10px] text-zinc-400 truncate ml-2 font-mono shrink-0">
                          {option.details}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
