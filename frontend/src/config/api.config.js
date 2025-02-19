
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  ENDPOINTS: {
    LOGIN: '/login',
    SIGNUP: '/signup',
    TASK: '/tasks',
  },
  TOKEN_KEY: 'auth_token'
};

export default API_CONFIG;