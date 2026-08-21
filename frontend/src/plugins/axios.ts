import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true, // Important for sending/receiving HTTP-only cookies
});

// Optional: Add response interceptor for handling 401s globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // You could dispatch a logout action or redirect to login here
      console.warn('Unauthorized access - might need to login again.');
    }
    return Promise.reject(error);
  }
);

export default api;
