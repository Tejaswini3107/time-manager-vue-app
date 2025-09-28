import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiService } from '../../src/services/api.js';

// Mock fetch
global.fetch = vi.fn();

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createWorkingTime', () => {
    it('should create working time with correct format', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ id: 1, success: true })
      };
      
      fetch.mockResolvedValue(mockResponse);

      const workingTimeData = {
        user_id: 1,
        start: '2025-09-28T09:00:00Z',
        end: '2025-09-28T17:00:00Z'
      };

      const result = await apiService.createWorkingTime(workingTimeData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/workingtimes'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            working_time: workingTimeData
          })
        })
      );
      expect(result).toEqual({ id: 1, success: true });
    });
  });

  describe('deleteWorkingTime', () => {
    it('should handle empty response from delete', async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('text/plain')
        },
        json: vi.fn().mockRejectedValue(new Error('Unexpected end of JSON input'))
      };
      
      fetch.mockResolvedValue(mockResponse);

      const result = await apiService.deleteWorkingTime(1);

      expect(result).toEqual({ 
        success: true, 
        message: 'Operation completed successfully' 
      });
    });
  });

  describe('getUsers', () => {
    it('should fetch users successfully', async () => {
      const mockUsers = [
        { id: 1, username: 'testuser', email: 'test@example.com' }
      ];
      
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockUsers)
      };
      
      fetch.mockResolvedValue(mockResponse);

      const result = await apiService.getUsers();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({
          method: 'GET'
        })
      );
      expect(result).toEqual(mockUsers);
    });
  });
});
