
import React from 'react';

interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  inputMode: 'decimal' | 'numeric';
}

const InputField: React.FC<InputFieldProps> = ({ value, onChange, inputMode }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <input
      type="text"
      inputMode={inputMode}
      className="w-full border border-gray-200 rounded p-2 text-center"
      value={value}
      onChange={handleChange}
    />
  );
};

export default InputField;
