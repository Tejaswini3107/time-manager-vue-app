// API Service Layer for Time Manager Application
const API_BASE_URL = 'http://localhost:4000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic HTTP request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    console.log('=== API REQUEST ===');
    console.log('URL:', url);
    console.log('Config:', config);

    try {
      const response = await fetch(url, config);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      // Check if response has content
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      // If no content or content-length is 0, return success message
      if (!contentType || !contentType.includes('application/json') || contentLength === '0') {
        console.log('Empty response or non-JSON content');
        console.log('=== API REQUEST SUCCESS ===');
        return { success: true, message: 'Operation completed successfully' };
      }
      
      // Try to parse JSON, but handle empty responses gracefully
      try {
        const responseData = await response.json();
        console.log('Response data:', responseData);
        console.log('=== API REQUEST SUCCESS ===');
        
        // Extract data field if it exists, otherwise return the full response
        return responseData.data || responseData;
      } catch (jsonError) {
        // If JSON parsing fails, it might be an empty response
        console.log('JSON parsing failed, treating as empty response:', jsonError.message);
        console.log('=== API REQUEST SUCCESS ===');
        return { success: true, message: 'Operation completed successfully' };
      }
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // USER ENDPOINTS
  async getUsers(filters = {}) {
    const params = new URLSearchParams();
    if (filters.email) params.append('email', filters.email);
    if (filters.username) params.append('username', filters.username);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    
    return this.request(endpoint);
  }

  async getUserById(userID) {
    return this.request(`/users/${userID}`);
  }

  async getUserEdit(userID) {
    return this.request(`/users/${userID}/edit`);
  }

  async getUserNew() {
    return this.request('/users/new');
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify({
        user: userData
      }),
    });
  }

  async updateUser(userID, userData) {
    return this.request(`/users/${userID}`, {
      method: 'PUT',
      body: JSON.stringify({ user: userData }),
    });
  }

  async patchUser(userID, userData) {
    return this.request(`/users/${userID}`, {
      method: 'PATCH',
      body: JSON.stringify({ user: userData }),
    });
  }

  async deleteUser(userID) {
    return this.request(`/users/${userID}`, {
      method: 'DELETE',
    });
  }

  // WORKING TIME ENDPOINTS
  async getWorkingTimes(userID, filters = {}) {
    const params = new URLSearchParams();
    if (filters.start) params.append('start', filters.start);
    if (filters.end) params.append('end', filters.end);
    if (userID) params.append('user_id', userID);
    
    const queryString = params.toString();
    const endpoint = queryString 
      ? `/workingtimes?${queryString}` 
      : '/workingtimes';
    
    return this.request(endpoint);
  }

  async getWorkingTimeById(id) {
    return this.request(`/workingtimes/${id}`);
  }

  async getWorkingTimeEdit(id) {
    return this.request(`/workingtimes/${id}/edit`);
  }

  async getWorkingTimeNew() {
    return this.request('/workingtimes/new');
  }

  async createWorkingTime(workingTimeData) {
    return this.request('/workingtimes', {
      method: 'POST',
      body: JSON.stringify({
        working_time: workingTimeData
      }),
    });
  }

  async updateWorkingTime(id, workingTimeData) {
    return this.request(`/workingtimes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        working_time: workingTimeData
      }),
    });
  }

  async patchWorkingTime(id, workingTimeData) {
    return this.request(`/workingtimes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        working_time: workingTimeData
      }),
    });
  }

  async deleteWorkingTime(id) {
    return this.request(`/workingtimes/${id}`, {
      method: 'DELETE',
    });
  }

  // CLOCKING ENDPOINTS
  async getClocks(userID) {
    const params = new URLSearchParams();
    if (userID) params.append('user_id', userID);
    const queryString = params.toString();
    const endpoint = queryString ? `/clocks?${queryString}` : '/clocks';
    return this.request(endpoint);
  }

  async getClockById(id) {
    return this.request(`/clocks/${id}`);
  }

  async getClockEdit(id) {
    return this.request(`/clocks/${id}/edit`);
  }

  async getClockNew() {
    return this.request('/clocks/new');
  }

  async createClock(clockData) {
    return this.request('/clocks', {
      method: 'POST',
      body: JSON.stringify({
        clock: clockData
      }),
    });
  }

  async updateClock(id, clockData) {
    return this.request(`/clocks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        clock: clockData
      }),
    });
  }

  async patchClock(id, clockData) {
    return this.request(`/clocks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        clock: clockData
      }),
    });
  }

  async deleteClock(id) {
    return this.request(`/clocks/${id}`, {
      method: 'DELETE',
    });
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;