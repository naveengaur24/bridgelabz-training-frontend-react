import axios from 'axios';
const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Automatically inject Authorization header if token is present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fundoo_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch 401 errors to clear session
api.interceptors.response.use(
  (response) => {
    return response.data; // Directly return backend ApiResponseDTO { success, message, data }
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('fundoo_token');
      localStorage.removeItem('fundoo_user');
      window.dispatchEvent(new Event('auth-expired'));
    }
    const errMsg = error.response?.data?.message || error.message || 'Server error occurred';
    return Promise.reject(new Error(errMsg));
  }
);

export const ApiService = {
  // USER APIS
  register(name, email, password) {
    return api.post('/users/register', { name, email, password });
  },
  async login(email, password) {
    const result = await api.post('/users/login', { email, password });
    if (result.success && result.data?.token) {
      localStorage.setItem('fundoo_token', result.data.token);
      localStorage.setItem('fundoo_user', JSON.stringify({
        userId: result.data.userId,
        email: result.data.email,
        name: result.data.name
      }));
    }
    return result;
  },

  deleteAccount() {
    return api.delete('/users');
  },

  forgotPassword(email) {
    return api.post('/users/forgot-password', { email });
  },

  verifyOtp(email, otp) {
    return api.post('/users/verify-otp', { email, otp });
  },

  resetPassword(email, otp, newPassword) {
    return api.post('/users/reset-password', { email, otp, newPassword });
  },

  logout() {
    localStorage.removeItem('fundoo_token');
    localStorage.removeItem('fundoo_user');
  },

  // NOTE APIS

  createNote(title, content, reminderTime = null) {
    return api.post('/notes', { title, content, reminderTime });
  },

  getAllNotes() {
    return api.get('/notes');
  },

  getNoteById(noteId) {
    return api.get(`/notes/${noteId}`);
  },

  updateNote(noteId, title, content, reminderTime = null) {
    return api.put(`/notes/${noteId}`, { title, content, reminderTime });
  },

  pinNote(noteId) {
    return api.put(`/notes/${noteId}/pin`);
  },

  archiveNote(noteId) {
    return api.put(`/notes/${noteId}/archive`);
  },

  trashNote(noteId) {
    return api.put(`/notes/${noteId}/trash`);
  },

  deleteNotePermanently(noteId) {
    return api.delete(`/notes/${noteId}`);
  },

  searchNotes(keyword) {
    return api.get(`/notes/search?keyword=${encodeURIComponent(keyword)}`);
  },

  getPinnedNotes() {
    return api.get('/notes/pinned');
  },

  getArchivedNotes() {
    return api.get('/notes/archived');
  },

  getTrashedNotes() {
    return api.get('/notes/trashed');
  },

  // NOTE & LABEL RELATIONSHIP APIS

  addLabelToNote(noteId, labelId) {
    return api.post(`/notes/${noteId}/labels/${labelId}`);
  },

  removeLabelFromNote(noteId, labelId) {
    return api.delete(`/notes/${noteId}/labels/${labelId}`);
  },

  getNotesByLabel(labelId) {
    return api.get(`/notes/label/${labelId}`);
  },

  // LABEL CRUD APIS

  createLabel(name) {
    return api.post('/labels', { name });
  },

  getAllLabels() {
    return api.get('/labels');
  },

  deleteLabel(labelId) {
    return api.delete(`/labels/${labelId}`);
  }
};
