import axios from 'axios';

// Configure API URL for development
export const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 5000 // Add timeout to handle network issues
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (!error.response) {
      console.error('Network error - make sure API is running');
    }
    return Promise.reject(error);
  }
);

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      console.error('Response error:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Request error:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;