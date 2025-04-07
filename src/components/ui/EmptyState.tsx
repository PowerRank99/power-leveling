
import React, { ReactNode } from 'react';

interface EmptyStateProps {
  message: string;
  action?: ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, action }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-4 border border-gray-200 text-center">
      <p className="text-gray-500 mb-4">{message}</p>
      {action}
    </div>
  );
};

export default EmptyState;
