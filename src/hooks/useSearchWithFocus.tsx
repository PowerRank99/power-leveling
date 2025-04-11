
import { useState, useRef, useEffect } from 'react';

interface UseSearchWithFocusOptions<T> {
  items?: T[];
  filterFunction?: (item: T, searchTerm: string) => boolean;
  debounceMs?: number;
}

export function useSearchWithFocus<T>({
  items = [],
  filterFunction,
  debounceMs = 300
}: UseSearchWithFocusOptions<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Focus management
  const focusInput = () => {
    if (inputRef.current) {
      const cursorPosition = inputRef.current.selectionStart || 0;
      
      // Use setTimeout to ensure focus happens after render
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
      }, 0);
    }
  };
  
  // Handle search term changes with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set loading state immediately for better UX
    if (newSearchTerm.trim() !== '') {
      setIsSearching(true);
    }
    
    // Debounce the filtering to avoid excessive computation
    debounceTimerRef.current = setTimeout(() => {
      filterItems(newSearchTerm);
      setIsSearching(false);
      focusInput();
    }, debounceMs);
  };
  
  // Filter items based on search term
  const filterItems = (term: string) => {
    if (!term.trim()) {
      setFilteredItems([]);
      return;
    }
    
    if (filterFunction) {
      setFilteredItems(items.filter(item => filterFunction(item, term)));
    } else {
      // Default filter implementation if none provided
      setFilteredItems(
        items.filter(item => 
          JSON.stringify(item).toLowerCase().includes(term.toLowerCase())
        )
      );
    }
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setFilteredItems([]);
    focusInput();
  };
  
  // Clean up any timers when component unmounts
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  return {
    searchTerm,
    filteredItems,
    isSearching,
    inputRef,
    handleSearchChange,
    clearSearch,
    focusInput
  };
}
