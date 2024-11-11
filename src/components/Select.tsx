'use client';

import React, { useState, useEffect } from 'react';
import * as Select from '@radix-ui/react-select';
import styles from '@styles/Select.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faCheck } from '@fortawesome/free-solid-svg-icons';

interface SelectItemProps {
  children: React.ReactNode;
  className?: string;
  value: string;
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectorProps {
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  value?: string | null;
  onValueChange: (value: string | null) => void;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <Select.Item className={styles.item} {...props} ref={forwardedRef}>
        <Select.ItemText>{children}</Select.ItemText>
        <Select.ItemIndicator className={styles.itemIndicator}>
          <FontAwesomeIcon icon={faCheck} />  
        </Select.ItemIndicator>
      </Select.Item>
    );
  }
);

SelectItem.displayName = 'SelectItem';

const Selector: React.FC<SelectorProps> = ({ options, placeholder = "Select...", label, value, onValueChange }) => {
  const [internalValue, setInternalValue] = useState<string | undefined>(value === null ? undefined : value);

  useEffect(() => {
    setInternalValue(value === null ? undefined : value);
  }, [value]);

  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue);
    onValueChange(newValue === "__all__" ? null : newValue);
  };

  return (
    <Select.Root 
      value={internalValue} 
      onValueChange={handleValueChange}
    >
      <Select.Trigger className={styles.trigger}>
        <Select.Value placeholder={placeholder}>
          {options.find(option => option.value === internalValue)?.label || placeholder}
        </Select.Value>
        <Select.Icon className={styles.selectIcon}>
          <FontAwesomeIcon icon={faChevronDown} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className={styles.content}>
          <Select.Viewport className={styles.viewport}>
            <Select.Group>
              {label && <Select.Label className={styles.label}>{label}</Select.Label>}
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select.Group>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

export default Selector;