import React from 'react';
import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';

interface Option {
  label: string;
  value: string;
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
        className={`inline-flex items-center justify-between rounded-md px-3 py-2 text-sm border border-blue-700 bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 focus:ring-2 focus:ring-blue-400 ${className}`}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon className="text-white">
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="z-50 bg-white rounded-md shadow-md border border-blue-200 text-blue-800">
          <Select.ScrollUpButton className="flex items-center justify-center py-1 text-blue-600">
            <ChevronUpIcon />
          </Select.ScrollUpButton>

          <Select.Viewport className="p-2 ">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="px-3 py-1.5 cursor-pointer rounded hover:bg-blue-100 focus:bg-blue-200 focus:outline-none"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>

          <Select.ScrollDownButton className="flex items-center justify-center py-1 text-blue-600">
            <ChevronDownIcon />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

export default SelectField;
  