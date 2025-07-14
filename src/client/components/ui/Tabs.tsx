import React, { createContext, useContext, useState } from 'react';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  children,
  className = ''
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const activeTab = value !== undefined ? value : internalValue;
  
  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleValueChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 backdrop-blur-sm shadow-sm rounded-t-lg ${className}`}>
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ 
  value, 
  children, 
  disabled = false,
  className = '' 
}) => {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsTrigger must be used within Tabs');
  }
  
  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;
  
  const handleClick = () => {
    if (!disabled) {
      setActiveTab(value);
    }
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        px-6 py-3 text-sm font-semibold transition-all duration-300 relative transform hover:scale-105
        ${isActive 
          ? 'text-blue-600 border-b-2 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-blue-100/50' 
          : 'text-gray-600 border-b-2 border-transparent hover:text-gray-800 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50'
        }
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        rounded-t-lg backdrop-blur-sm
        ${className}
      `}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ 
  value, 
  children, 
  className = '' 
}) => {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsContent must be used within Tabs');
  }
  
  const { activeTab } = context;
  
  if (activeTab !== value) {
    return null;
  }
  
  return (
    <div className={`pt-6 px-6 pb-6 bg-gradient-to-b from-white to-gray-50 text-gray-900 rounded-b-lg shadow-sm backdrop-blur-sm border-x border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};
