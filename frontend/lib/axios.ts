import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Proxies to localhost:4000 (Local) or Render (Prod)
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default api;