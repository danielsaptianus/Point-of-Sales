import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true, // Important for sending/receiving HTTP-only cookies
});

import router from '@/router';

// Optional: Add response interceptor for handling 401s globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized access - redirecting to login.');
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
