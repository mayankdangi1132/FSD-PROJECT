import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// attach the token to every request if we have one
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// pulls the message our backend sends back
export const getError = (err) => err.response?.data?.message || 'Something went wrong. Please try again.';

// uploads one image and returns its url
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await API.post('/upload', formData);
  return data.url;
};

export default API;
