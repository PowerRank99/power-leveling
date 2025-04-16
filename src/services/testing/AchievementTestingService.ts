
// Only fixing specific parts of the AchievementTestingService
async runAllTests(): Promise<ServiceResponse<AchievementTestResult[]>> {
  try {
    const achievements = await AchievementUtils.getAllAchievements();
    return this.runTestsForAchievements(achievements);
  } catch (error) {
    return createErrorResponse(
      'Failed to run all tests',
      error instanceof Error ? error.message : 'Unknown error',
      ErrorCategory.UNKNOWN_ERROR
    );
  }
}

async runCategoryTests(category: AchievementCategory): Promise<ServiceResponse<AchievementTestResult[]>> {
  try {
    const achievements = await AchievementUtils.getAllAchievements();
    const categoryAchievements = achievements.filter(a => a.category === category);
    return this.runTestsForAchievements(categoryAchievements);
  } catch (error) {
    return createErrorResponse(
      `Failed to run tests for category ${category}`,
      error instanceof Error ? error.message : 'Unknown error',
      ErrorCategory.UNKNOWN_ERROR
    );
  }
}

async runRankTests(rank: AchievementRank): Promise<ServiceResponse<AchievementTestResult[]>> {
  try {
    const achievements = await AchievementUtils.getAllAchievements();
    const rankAchievements = achievements.filter(a => a.rank === rank);
    return this.runTestsForAchievements(rankAchievements);
  } catch (error) {
    return createErrorResponse(
      `Failed to run tests for rank ${rank}`,
      error instanceof Error ? error.message : 'Unknown error',
      ErrorCategory.UNKNOWN_ERROR
    );
  }
}
