
import React, { useState, useEffect, useRef } from 'react';

interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  inputMode: 'decimal' | 'numeric';
}

const InputField: React.FC<InputFieldProps> = ({ value, onChange, inputMode }) => {
  const [localValue, setLocalValue] = useState(value);
  const lastUserEditRef = useRef<number | null>(null);
  const isFirstRenderRef = useRef(true);
  const previousValueRef = useRef(value);
  
  // Update local state when prop changes, unless user just edited
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      previousValueRef.current = value;
      return;
    }
    
    // Skip updates right after user edits to prevent flickering
    const now = Date.now();
    if (lastUserEditRef.current && now - lastUserEditRef.current < 5000) {
      console.log(`InputField: Skipping prop update (${previousValueRef.current} -> ${value}) due to recent user edit`);
      return;
    }
    
    // Only update if the value actually changed and isn't empty/zero
    if (value !== localValue && value && value !== '0' && value !== previousValueRef.current) {
      console.log(`InputField: Updating local value from prop ${localValue} -> ${value}`);
      setLocalValue(value);
      previousValueRef.current = value;
    }
  }, [value, localValue]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log(`InputField: User edited value ${localValue} -> ${newValue}`);
    setLocalValue(newValue);
    lastUserEditRef.current = Date.now();
    previousValueRef.current = newValue;
    onChange(newValue);
  };

  return (
    <input
      type="text"
      inputMode={inputMode}
      className="w-full border border-gray-200 rounded p-2 text-center"
      value={localValue}
      onChange={handleChange}
    />
  );
};

export default InputField;
