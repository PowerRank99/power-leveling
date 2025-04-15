
/**
 * Helper functions for achievement ID standardization
 */
export const AchievementIdHelper = {
  /**
   * Validates achievement ID format
   */
  isValidFormat(id: string): boolean {
    // IDs should be lowercase, hyphen-separated, alphanumeric
    return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(id);
  },

  /**
   * Normalizes an achievement ID to the standard format
   */
  normalize(id: string): string {
    return id.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9-]/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  },

  /**
   * Suggests a standardized ID based on an achievement name
   */
  suggestId(name: string): string {
    return this.normalize(name);
  },

  /**
   * Validates achievement ID uniqueness within a category
   */
  isUniqueInCategory(id: string, categoryAchievements: any[]): boolean {
    return !categoryAchievements.some(achievement => {
      const achievementId = typeof achievement === 'string' 
        ? achievement 
        : achievement?.id;
      return achievementId === id;
    });
  }
};

