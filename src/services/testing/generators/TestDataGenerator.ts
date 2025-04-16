
import { TestDataGenerator } from './index';

export class TestDataGeneratorManager {
  private generators: TestDataGenerator[] = [];
  
  constructor(generators: TestDataGenerator[] = []) {
    this.generators = generators;
  }
  
  addGenerator(generator: TestDataGenerator): void {
    this.generators.push(generator);
  }
  
  getGenerators(): TestDataGenerator[] {
    return this.generators;
  }
  
  async executeAll(userId: string, options?: any): Promise<any[]> {
    const results = [];
    
    for (const generator of this.generators) {
      try {
        const result = await generator.generate(userId, options);
        results.push(result);
      } catch (error) {
        console.error('Error executing generator:', error);
      }
    }
    
    return results;
  }
  
  async cleanupAll(userId: string): Promise<boolean> {
    let success = true;
    
    for (const generator of this.generators) {
      try {
        const result = await generator.cleanup(userId);
        if (!result) {
          success = false;
        }
      } catch (error) {
        console.error('Error cleaning up generator:', error);
        success = false;
      }
    }
    
    return success;
  }
}

export const createTestDataGenerator = (generators: TestDataGenerator[] = []): TestDataGenerator => {
  const manager = new TestDataGeneratorManager(generators);
  
  return {
    async generate(userId: string, options?: any) {
      const results = await manager.executeAll(userId, options);
      return {
        success: results.every(r => r.success),
        message: `Generated ${results.length} test data items`,
        data: results
      };
    },
    
    async cleanup(userId: string) {
      return manager.cleanupAll(userId);
    },
    
    getGenerators() {
      return manager.getGenerators();
    }
  };
};
