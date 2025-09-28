/**
 * Date utility functions for consistent date handling across the application
 */

/**
 * Creates an ISO datetime string from date and time strings
 * This function ensures consistent date handling without timezone issues
 * 
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @param {string} timeStr - Time string in HH:MM format
 * @returns {string} ISO datetime string
 */
export const createISODateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) {
    throw new Error('Date and time strings are required');
  }

  // Parse date components
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  // Validate inputs
  if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
    throw new Error('Invalid date or time format');
  }

  // Create date in UTC to avoid timezone issues
  // Note: month is 0-indexed in JavaScript Date constructor
  const date = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
  
  return date.toISOString();
};

/**
 * Formats a date string for display in the UI
 * 
 * @param {string} isoString - ISO datetime string
 * @returns {string} Formatted date string
 */
export const formatDateForDisplay = (isoString) => {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formats a time string for display in the UI
 * 
 * @param {string} isoString - ISO datetime string
 * @returns {string} Formatted time string
 */
export const formatTimeForDisplay = (isoString) => {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

/**
 * Gets the current date in YYYY-MM-DD format for date inputs
 * 
 * @returns {string} Current date in YYYY-MM-DD format
 */
export const getCurrentDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Calculates the duration between two ISO datetime strings
 * 
 * @param {string} startISO - Start datetime in ISO format
 * @param {string} endISO - End datetime in ISO format
 * @returns {number} Duration in hours
 */
export const calculateDuration = (startISO, endISO) => {
  if (!startISO || !endISO) return 0;
  
  const start = new Date(startISO);
  const end = new Date(endISO);
  
  if (end <= start) return 0;
  
  const diffMs = end - start;
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
};

/**
 * Validates that a date string is in the correct format
 * 
 * @param {string} dateStr - Date string to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidDateString = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return false;
  
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  
  const date = new Date(dateStr + 'T00:00:00');
  return date instanceof Date && !isNaN(date);
};

/**
 * Validates that a time string is in the correct format
 * 
 * @param {string} timeStr - Time string to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidTimeString = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return false;
  
  const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(timeStr);
};

/**
 * Gets the start and end of the current week
 * 
 * @returns {Object} Object with start and end dates in YYYY-MM-DD format
 */
export const getCurrentWeek = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  return {
    start: formatDate(startOfWeek),
    end: formatDate(endOfWeek)
  };
};
