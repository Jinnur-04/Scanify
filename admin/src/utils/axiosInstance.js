import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

instance.interceptors.request.use(
  (config) => {
    // Read persisted Redux state from localStorage
    const persistedState = localStorage.getItem('persist:root');
    if (persistedState) {
      const parsedState = JSON.parse(persistedState);
      const userState = JSON.parse(parsedState.user);
      const token = userState.token;
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
