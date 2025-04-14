/**
 * Service for reporting and tracking errors
 */

interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
  userId?: string;
  pathname: string;
  userAgent: string;
  additionalInfo?: Record<string, any>;
}

export class ErrorReportingService {
  private static errorReports: ErrorReport[] = [];
  private static maxStoredErrors = 50;
  
  /**
   * Report an error
   */
  static reportError(
    error: Error, 
    componentStack?: string, 
    additionalInfo?: Record<string, any>
  ): void {
    try {
      const report: ErrorReport = {
        message: error.message,
        stack: error.stack,
        componentStack,
        timestamp: Date.now(),
        pathname: window.location.pathname,
        userAgent: navigator.userAgent,
        additionalInfo
      };
      
      // Store locally
      this.storeErrorReport(report);
      
      // Log to console in development
      if (import.meta.env.DEV) {
        console.group('Error Report');
        console.error(error);
        if (componentStack) {
          console.error('Component Stack:', componentStack);
        }
        console.groupEnd();
      }
      
      // In production, you might want to send this to a backend service
      if (import.meta.env.PROD) {
        this.sendErrorToBackend(report);
      }
    } catch (reportingError) {
      // Avoid infinite loops if error reporting itself fails
      console.error('Error in error reporting:', reportingError);
    }
  }
  
  /**
   * Store error report locally
   */
  private static storeErrorReport(report: ErrorReport): void {
    this.errorReports.unshift(report);
    
    // Keep only the most recent errors
    if (this.errorReports.length > this.maxStoredErrors) {
      this.errorReports = this.errorReports.slice(0, this.maxStoredErrors);
    }
    
    // Store in localStorage for persistence across page reloads
    try {
      localStorage.setItem('errorReports', JSON.stringify(this.errorReports));
    } catch (e) {
      // localStorage might be full or disabled
      console.warn('Failed to store error reports in localStorage:', e);
    }
  }
  
  /**
   * Send error report to backend
   * This would be implemented when we add error tracking to the backend
   */
  private static async sendErrorToBackend(report: ErrorReport): Promise<void> {
    // Implementation will be added in the future
    // For now just simulate sending
    console.log('Would send error report to backend:', report);
  }
  
  /**
   * Get all stored error reports
   */
  static getErrorReports(): ErrorReport[] {
    // Try to load from localStorage if not already loaded
    if (this.errorReports.length === 0) {
      try {
        const storedReports = localStorage.getItem('errorReports');
        if (storedReports) {
          this.errorReports = JSON.parse(storedReports);
        }
      } catch (e) {
        console.warn('Failed to load error reports from localStorage:', e);
      }
    }
    
    return [...this.errorReports];
  }
  
  /**
   * Clear all stored error reports
   */
  static clearErrorReports(): void {
    this.errorReports = [];
    try {
      localStorage.removeItem('errorReports');
    } catch (e) {
      console.warn('Failed to clear error reports from localStorage:', e);
    }
  }
}
