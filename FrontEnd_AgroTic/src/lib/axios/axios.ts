import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let refreshFunction: (() => Promise<void>) | null = null;
let navigateFunction: ((path: string) => void) | null = null;
let logoutFunction: (() => Promise<void>) | null = null;

export const setupAxiosInterceptors = (
  refresh: () => Promise<void>,
  navigate: (path: string) => void,
  logout?: () => Promise<void>
) => {
  refreshFunction = refresh;
  navigateFunction = navigate;
  logoutFunction = logout || null;

  // Response interceptor
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Only try to refresh tokens for 401 errors that are NOT:
      // 1. Already retried
      // 2. Auth endpoints (/auth/*)
      // 3. Profile endpoint (/usuarios/me) - this is the initial auth check
      if (error.response?.status === 401 && refreshFunction && !error.config._retry &&
          !error.config.url.startsWith('/auth/') && !error.config.url.includes('/usuarios/me')) {
        try {
          console.log('Axios interceptor: Attempting token refresh for failed request');
          await refreshFunction();
          // Mark the request as retried
          error.config._retry = true;
          // Retry the original request
          console.log('Axios interceptor: Retrying original request after refresh');
          return apiClient(error.config);
        } catch (refreshError) {
          // Refresh failed, logout and redirect to login
          console.log('Axios interceptor: Token refresh failed, logging out user');
          if (logoutFunction) {
            await logoutFunction();
          } else if (navigateFunction) {
            navigateFunction('/login');
          }
        }
      }
      return Promise.reject(error);
    }
  );
};

export default apiClient;
