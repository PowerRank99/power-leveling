
import { registerClasses } from './registry/ClassRegistrations';

/**
 * Initialize the class system
 * This should be called once when the application starts
 */
export function initializeClassSystem() {
  console.log('Initializing class system...');
  
  // Register all classes with the class registry
  registerClasses();
  
  console.log('Class system initialized successfully.');
}

// Export a function to check if the system is already initialized
export function isClassSystemInitialized(): boolean {
  try {
    // Try to access the registry
    const { getClassRegistry } = require('./registry/ClassRegistry');
    const registry = getClassRegistry();
    
    // Check if we have at least one class configured
    const allClasses = registry.getAllClassConfigs();
    return allClasses.length > 0;
  } catch (error) {
    console.error('Error checking if class system is initialized:', error);
    return false;
  }
}
