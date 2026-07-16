import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

function getHeaders() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('buspawa_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const api = {
  get: (path: string) => axios.get(`${API_URL}${path}`, { headers: getHeaders() }).then(r => r.data),
  post: (path: string, data?: any) => axios.post(`${API_URL}${path}`, data, { headers: getHeaders() }).then(r => r.data),
  patch: (path: string, data?: any) => axios.patch(`${API_URL}${path}`, data, { headers: getHeaders() }).then(r => r.data),
  delete: (path: string) => axios.delete(`${API_URL}${path}`, { headers: getHeaders() }).then(r => r.data),
};

export default api;
