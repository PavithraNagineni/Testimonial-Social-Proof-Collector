import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});

// If an access token has expired, try refreshing once and replay the request.
// This keeps the frontend from ever surfacing a raw 401 during an active session.
let isRefreshing = false;
let queue = [];

function processQueue(error) {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  queue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error;
    if (!response || response.status !== 401 || config._retry || config.url?.includes('/auth/')) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      })
        .then(() => api(config))
        .catch((err) => Promise.reject(err));
    }

    config._retry = true;
    isRefreshing = true;
    try {
      await api.post('/auth/refresh');
      processQueue(null);
      return api(config);
    } catch (refreshErr) {
      processQueue(refreshErr);
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
