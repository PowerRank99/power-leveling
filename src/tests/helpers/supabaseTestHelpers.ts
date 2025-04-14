
import { SupabaseClient } from '@supabase/supabase-js';
import { vi } from 'vitest';

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
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => createMockDbResponse(responseData, responseError)),
        order: vi.fn(() => createMockDbResponse(responseData, responseError))
      }))
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => createMockDbResponse(responseData, responseError))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => createMockDbResponse(responseData, responseError))
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => createMockDbResponse(responseData, responseError))
    }))
  };
}

/**
 * Creates a mock Supabase client
 */
export function createMockSupabaseClient(responseData: any = null, responseError: any = null) {
  return {
    from: vi.fn(() => createMockQueryBuilder(responseData, responseError)),
    rpc: vi.fn(() => createMockDbResponse(responseData, responseError))
  } as unknown as SupabaseClient;
}
