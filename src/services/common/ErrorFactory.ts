
import { ErrorCategory, ServiceErrorResponse, createErrorResponse } from './ErrorHandlingService';

/**
 * Factory for creating standardized error responses across the application
 */
export class ErrorFactory {
  // Authentication errors
  static createAuthenticationError(message: string, technical: string): ServiceErrorResponse {
    return createErrorResponse(
      message,
      technical,
      ErrorCategory.AUTHENTICATION,
      'AUTH_ERROR'
    );
  }
  
  static createSessionExpiredError(): ServiceErrorResponse {
    return createErrorResponse(
      'Sua sessão expirou, por favor faça login novamente',
      'User session expired or invalid',
      ErrorCategory.AUTHENTICATION,
      'SESSION_EXPIRED'
    );
  }
  
  // Database errors
  static createDatabaseError(message: string, technical: string): ServiceErrorResponse {
    return createErrorResponse(
      message || 'Erro ao acessar dados',
      technical,
      ErrorCategory.DATABASE,
      'DB_ERROR'
    );
  }
  
  static createRecordNotFoundError(entity: string): ServiceErrorResponse {
    return createErrorResponse(
      `${entity} não encontrado`,
      `${entity} record not found in database`,
      ErrorCategory.DATABASE,
      'RECORD_NOT_FOUND'
    );
  }
  
  // Validation errors
  static createValidationError(message: string, details: string): ServiceErrorResponse {
    return createErrorResponse(
      message,
      details,
      ErrorCategory.VALIDATION,
      'VALIDATION_ERROR'
    );
  }
  
  // Network errors
  static createNetworkError(message: string = 'Erro de conexão'): ServiceErrorResponse {
    return createErrorResponse(
      message,
      'Network request failed',
      ErrorCategory.NETWORK,
      'NETWORK_ERROR'
    );
  }
  
  // Business logic errors
  static createBusinessLogicError(message: string, technical: string, code: string): ServiceErrorResponse {
    return createErrorResponse(
      message,
      technical,
      ErrorCategory.BUSINESS_LOGIC,
      code
    );
  }
  
  // Achievement system errors
  static createAchievementError(message: string, technical: string): ServiceErrorResponse {
    return createErrorResponse(
      message || 'Erro ao processar conquistas',
      technical,
      ErrorCategory.BUSINESS_LOGIC,
      'ACHIEVEMENT_ERROR'
    );
  }
  
  // XP system errors
  static createXPError(message: string, technical: string): ServiceErrorResponse {
    return createErrorResponse(
      message || 'Erro ao calcular XP',
      technical,
      ErrorCategory.BUSINESS_LOGIC,
      'XP_ERROR'
    );
  }
  
  // Workout errors
  static createWorkoutError(message: string, technical: string): ServiceErrorResponse {
    return createErrorResponse(
      message || 'Erro ao processar treino',
      technical,
      ErrorCategory.BUSINESS_LOGIC,
      'WORKOUT_ERROR'
    );
  }
}
