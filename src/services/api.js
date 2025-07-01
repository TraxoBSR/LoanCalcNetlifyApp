import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 429) {
      throw new Error('Too many requests. Please try again later.');
    } else if (error.response?.status === 403) {
      throw new Error(error.response.data.message || 'Access denied');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.');
    }
    
    throw error;
  }
);

export const apiService = {
  async submitInputs(inputs) {
    const response = await api.post('/calculator/submit-inputs', inputs);
    return response.data;
  },

  async checkUsage(email) {
    const response = await api.post('/user/check-usage', { email });
    return response.data;
  },

  async validateUser(userData) {
    const response = await api.post('/user/validate', userData);
    return response.data;
  },

  async requestReport(userData, inputs, results) {
    const response = await api.post('/report/request', {
      userData,
      inputs,
      results
    });
    return response.data;
  },

  async getCalculationHistory(email) {
    const response = await api.get(`/calculator/history/${encodeURIComponent(email)}`);
    return response.data;
  },

  async getReportHistory(email) {
    const response = await api.get(`/report/history/${encodeURIComponent(email)}`);
    return response.data;
  }
};

// For backward compatibility, keep the mock service but mark it as deprecated
export const mockApiService = {
  async submitInputs(inputs) {
    console.warn('Using deprecated mockApiService. Please use apiService instead.');
    return apiService.submitInputs(inputs);
  },

  async checkUsage(email) {
    console.warn('Using deprecated mockApiService. Please use apiService instead.');
    return apiService.checkUsage(email);
  },

  async validateUser(userData) {
    console.warn('Using deprecated mockApiService. Please use apiService instead.');
    return apiService.validateUser(userData);
  },

  async requestReport(userData, inputs, results) {
    console.warn('Using deprecated mockApiService. Please use apiService instead.');
    return apiService.requestReport(userData, inputs, results);
  }
};