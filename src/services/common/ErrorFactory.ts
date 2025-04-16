
import { ErrorCategory, ServiceResponse, createErrorResponse } from './ErrorHandlingService';

/**
 * Factory for creating standardized error responses across the application
 */
export class ErrorFactory {
  // Authentication errors
  static createAuthenticationError(message: string, technical: string): ServiceResponse<any> {
    return createErrorResponse(
      message,
      technical,
      ErrorCategory.AUTHENTICATION,
      'AUTH_ERROR'
    );
  }
  
  static createSessionExpiredError(): ServiceResponse<any> {
    return createErrorResponse(
      'Sua sessão expirou, por favor faça login novamente',
      'User session expired or invalid',
      ErrorCategory.AUTHENTICATION,
      'SESSION_EXPIRED'
    );
  }
  
  // Database errors
  static createDatabaseError(message: string, technical: string): ServiceResponse<any> {
    return createErrorResponse(
      message || 'Erro ao acessar dados',
      technical,
      ErrorCategory.DATABASE,
      'DB_ERROR'
    );
  }
  
  static createRecordNotFoundError(entity: string): ServiceResponse<any> {
    return createErrorResponse(
      `${entity} não encontrado`,
      `${entity} record not found in database`,
      ErrorCategory.DATABASE,
      'RECORD_NOT_FOUND'
    );
  }
  
  // Validation errors
  static createValidationError(message: string, details: string): ServiceResponse<any> {
    return createErrorResponse(
      message,
      details,
      ErrorCategory.VALIDATION_ERROR,
      'VALIDATION_ERROR'
    );
  }
  
  // Network errors
  static createNetworkError(message: string = 'Erro de conexão'): ServiceResponse<any> {
    return createErrorResponse(
      message,
      'Network request failed',
      ErrorCategory.NETWORK,
      'NETWORK_ERROR'
    );
  }
  
  // Business logic errors
  static createBusinessLogicError(message: string, technical: string, code: string): ServiceResponse<any> {
    return createErrorResponse(
      message,
      technical,
      ErrorCategory.BUSINESS_LOGIC,
      code
    );
  }
  
  // Achievement system errors
  static createAchievementError(message: string, technical: string): ServiceResponse<any> {
    return createErrorResponse(
      message || 'Erro ao processar conquistas',
      technical,
      ErrorCategory.BUSINESS_LOGIC,
      'ACHIEVEMENT_ERROR'
    );
  }
  
  // XP system errors
  static createXPError(message: string, technical: string): ServiceResponse<any> {
    return createErrorResponse(
      message || 'Erro ao calcular XP',
      technical,
      ErrorCategory.BUSINESS_LOGIC,
      'XP_ERROR'
    );
  }
  
  // Workout errors
  static createWorkoutError(message: string, technical: string): ServiceResponse<any> {
    return createErrorResponse(
      message || 'Erro ao processar treino',
      technical,
      ErrorCategory.BUSINESS_LOGIC,
      'WORKOUT_ERROR'
    );
  }
}
