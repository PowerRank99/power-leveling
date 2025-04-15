
export * from '../AchievementIdentifierService';
export * from '../utils/AchievementIdentifierUtils';

// Export message to warn about using the deprecated service
// This is just to help locate uses of deprecated service during code reviews
export const DEPRECATION_MESSAGE = 'AchievementIdMappingService is deprecated. Use AchievementIdentifierUtils instead.';
