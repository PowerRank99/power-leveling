
import React from 'react';

export interface SetHeaderProps {
  /**
   * Column labels for the set header
   */
  columns?: {
    set?: string;
    previous?: string;
    weight?: string;
    reps?: string;
    actions?: string;
  };
  /**
   * Custom CSS classes for the header container
   */
  className?: string;
  /**
   * Column sizes using Tailwind's grid-cols classes
   */
  columnSizes?: {
    set?: string;
    previous?: string;
    weight?: string;
    reps?: string;
    actions?: string;
  };
}

/**
 * Reusable header component for set tables with customizable columns and sizes
 */
const SetHeader: React.FC<SetHeaderProps> = ({
  columns = {},
  className = '',
  columnSizes = {}
}) => {
  // Default column labels
  const defaultColumns = {
    set: 'SET',
    previous: 'PREVIOUS',
    weight: 'KG',
    reps: 'REPS',
    actions: 'ACTIONS'
  };

  // Default column sizes
  const defaultColumnSizes = {
    set: 'col-span-1',
    previous: 'col-span-3',
    weight: 'col-span-3',
    reps: 'col-span-3',
    actions: 'col-span-2'
  };

  // Merge defaults with provided props
  const mergedColumns = { ...defaultColumns, ...columns };
  const mergedColumnSizes = { ...defaultColumnSizes, ...columnSizes };

  return (
    <div className={`grid grid-cols-12 gap-2 mb-3 text-sm font-medium text-gray-500 ${className}`}>
      <div className={`${mergedColumnSizes.set}`}>{mergedColumns.set}</div>
      <div className={`${mergedColumnSizes.previous}`}>{mergedColumns.previous}</div>
      <div className={`${mergedColumnSizes.weight} text-center`}>{mergedColumns.weight}</div>
      <div className={`${mergedColumnSizes.reps} text-center`}>{mergedColumns.reps}</div>
      <div className={`${mergedColumnSizes.actions} text-center`}>{mergedColumns.actions}</div>
    </div>
  );
};

export default SetHeader;
