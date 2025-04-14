
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a mock Supabase response
 */
export function createMockDbResponse<T>(data: T | null = null, error: any = null) {
  return {
    data,
    error,
    count: data ? (Array.isArray(data) ? data.length : 1) : 0,
  };
}

/**
 * Creates a mock Supabase query builder
 */
export function createMockQueryBuilder(responseData: any = null, responseError: any = null) {
  return {
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => createMockDbResponse(responseData, responseError)),
        order: jest.fn(() => createMockDbResponse(responseData, responseError))
      }))
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => createMockDbResponse(responseData, responseError))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => createMockDbResponse(responseData, responseError))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => createMockDbResponse(responseData, responseError))
    }))
  };
}

/**
 * Creates a mock Supabase client
 */
export function createMockSupabaseClient(responseData: any = null, responseError: any = null) {
  return {
    from: jest.fn(() => createMockQueryBuilder(responseData, responseError)),
    rpc: jest.fn(() => createMockDbResponse(responseData, responseError))
  } as unknown as SupabaseClient;
}

