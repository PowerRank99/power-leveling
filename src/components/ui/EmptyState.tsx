
import React, { ReactNode } from 'react';
import * as LucideIcons from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  icon?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  message, 
  icon, 
  title, 
  description, 
  action 
}) => {
  // Render the icon dynamically if provided
  const IconComponent = icon ? 
    // Cast to unknown first, then to the desired type to avoid TypeScript error
    (LucideIcons as unknown as Record<string, React.ComponentType<any>>)[icon] 
    : null;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-4 border border-gray-200 text-center">
      {IconComponent && (
        <div className="flex justify-center mb-4">
          <IconComponent className="h-12 w-12 text-gray-300" />
        </div>
      )}
      
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      {description && <p className="text-gray-500 mb-4">{description}</p>}
      {message && <p className="text-gray-500 mb-4">{message}</p>}
      
      {action}
    </div>
  );
};

export default EmptyState;
