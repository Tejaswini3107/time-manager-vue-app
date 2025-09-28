import { describe, it, expect } from 'vitest';
import { 
  createISODateTime, 
  formatDateForDisplay, 
  formatTimeForDisplay,
  getCurrentDateString,
  calculateDuration,
  isValidDateString,
  isValidTimeString,
  getCurrentWeek
} from '../../src/utils/dateUtils.js';

describe('Date Utils', () => {
  describe('createISODateTime', () => {
    it('should create correct ISO datetime for 22-09-2025', () => {
      const result = createISODateTime('2025-09-22', '09:00');
      expect(result).toBe('2025-09-22T09:00:00.000Z');
    });

    it('should create correct ISO datetime for 28-09-2025', () => {
      const result = createISODateTime('2025-09-28', '15:00');
      expect(result).toBe('2025-09-28T15:00:00.000Z');
    });

    it('should handle edge cases', () => {
      const result = createISODateTime('2025-12-31', '23:59');
      expect(result).toBe('2025-12-31T23:59:00.000Z');
    });

    it('should throw error for invalid inputs', () => {
      expect(() => createISODateTime('', '09:00')).toThrow('Date and time strings are required');
      expect(() => createISODateTime('2025-09-22', '')).toThrow('Date and time strings are required');
      expect(() => createISODateTime('invalid-date', '09:00')).toThrow('Invalid date or time format');
    });
  });

  describe('formatDateForDisplay', () => {
    it('should format ISO string to display format', () => {
      const result = formatDateForDisplay('2025-09-22T09:00:00.000Z');
      expect(result).toBe('22/09/2025');
    });
  });

  describe('formatTimeForDisplay', () => {
    it('should format ISO string to time format', () => {
      const result = formatTimeForDisplay('2025-09-22T09:00:00.000Z');
      expect(result).toBe('09:00');
    });
  });

  describe('calculateDuration', () => {
    it('should calculate duration correctly', () => {
      const start = '2025-09-22T09:00:00.000Z';
      const end = '2025-09-22T17:00:00.000Z';
      const result = calculateDuration(start, end);
      expect(result).toBe(8);
    });

    it('should handle partial hours', () => {
      const start = '2025-09-22T09:00:00.000Z';
      const end = '2025-09-22T12:30:00.000Z';
      const result = calculateDuration(start, end);
      expect(result).toBe(3.5);
    });
  });

  describe('isValidDateString', () => {
    it('should validate correct date strings', () => {
      expect(isValidDateString('2025-09-22')).toBe(true);
      expect(isValidDateString('2025-12-31')).toBe(true);
    });

    it('should reject invalid date strings', () => {
      expect(isValidDateString('')).toBe(false);
      expect(isValidDateString('invalid')).toBe(false);
      expect(isValidDateString('2025-13-01')).toBe(false);
      expect(isValidDateString('2025-02-30')).toBe(false);
    });
  });

  describe('isValidTimeString', () => {
    it('should validate correct time strings', () => {
      expect(isValidTimeString('09:00')).toBe(true);
      expect(isValidTimeString('23:59')).toBe(true);
      expect(isValidTimeString('00:00')).toBe(true);
    });

    it('should reject invalid time strings', () => {
      expect(isValidTimeString('')).toBe(false);
      expect(isValidTimeString('25:00')).toBe(false);
      expect(isValidTimeString('12:60')).toBe(false);
      expect(isValidTimeString('invalid')).toBe(false);
    });
  });
});
