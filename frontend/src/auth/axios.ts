import Axios from "axios";

const axios = Axios.create({
  baseURL: "http://localhost:3333",
  withCredentials: true, // Include cookies in requests
});

// Add request interceptor to include token from URL params or localStorage
axios.interceptors.request.use((config) => {
  // Check for token in URL params (from OAuth redirect)
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get('token');

  // Check for token in localStorage
  const tokenFromStorage = localStorage.getItem('accessToken');

  const token = tokenFromUrl || tokenFromStorage;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // Store token in localStorage if it came from URL
    if (tokenFromUrl) {
      localStorage.setItem('accessToken', tokenFromUrl);
      // Remove token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  return config;
});

// Add response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored token on auth error
      localStorage.removeItem('accessToken');
      // Redirect to login if needed
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
