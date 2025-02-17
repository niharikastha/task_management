import { authModel } from '../models/authModel';

export const authController = {
  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  validatePassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/.test(password);
  },

  async handleLogin(credentials) {
    try {
      const response = await authModel.login(credentials);
      if (response.success) {
        localStorage.setItem('token', response.data.token);
      }
      return response;
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  },

  async handleSignup(userData) {
    try {
      const response = await authModel.signup(userData);
      if (response.success) {
        localStorage.setItem('token', response.data.token);
      }
      return response;
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  }
};