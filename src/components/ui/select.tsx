import React from 'react';
import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';

interface Option {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SelectFieldProps {
  name: string;
  placeholder?: string;
  options: Option[];
  className?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

const SelectField: React.FC<SelectFieldProps> = ({
  name,
  placeholder = 'Select option',
  options,
  className = '',
  value,
  onValueChange,
}) => {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger
        id={name}
        className={`inline-flex items-center justify-between rounded-md px-3 h-9 py-0 text-sm 
          bg-gradient-to-b from-[#55AC8A] to-[#4da684] text-white shadow-md 
          hover:from-[#4da684] hover:to-[#439b77] 
          focus-visible:ring-[#55AC8A]/50 border border-transparent 
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#55AC8A]/50
          ${className}`}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon className="text-white">
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="z-50 bg-white rounded-md shadow-md border border-gray-300 text-black"
          side="bottom"
          align="start"
          sideOffset={0}
        >
          <Select.ScrollUpButton className="flex items-center justify-center py-1 text-black">
            <ChevronUpIcon />
          </Select.ScrollUpButton>

          <Select.Viewport
            className="p-0 max-h-[220px] min-h-[20px] overflow-y-scroll"
            style={{ touchAction: 'none', overscrollBehavior: 'contain' }}
          >
            {options.map((option) =>
              option.disabled ? (
                <div
                  key={option.value}
                  className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50 cursor-default select-none rounded"
                >
                  {option.label}
                </div>
              ) : (
              <Select.Item
                key={option.value}
                value={option.value}
                  className="px-3 h-9 flex items-center py-0 cursor-pointer rounded hover:bg-gray-100 focus:bg-gray-200 focus:outline-none"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
              </Select.Item>
              )
            )}
          </Select.Viewport>

          <Select.ScrollDownButton className="flex items-center justify-center py-1 text-black">
            <ChevronDownIcon />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>

    </Select.Root>
  );
};

export default SelectField;
