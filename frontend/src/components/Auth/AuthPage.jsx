// src/components/Auth/AuthPage.jsx
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './auth.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/;
    return passwordRegex.test(password);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters long and include uppercase, lowercase, number, and special character';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        // Handle successful auth
      } else {
        setErrors({ submit: data.message });
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-image">
          <img 
            src="/auth-illustration.webp" 
            alt="Illustration" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        <div className="auth-form">
          <div className="auth-form-container">
            <h2 className="auth-title">
              {isLogin ? 'Hello Again!' : 'Create Account'}
            </h2>
            <p className="auth-subtitle">
              {isLogin ? 'Welcome back you\'ve been missed!' : 'Get started with your account'}
            </p>

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    className="input-field"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  {errors.name && <p className="error-message">{errors.name}</p>}
                </div>
              )}

              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  className="input-field"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {errors.email && <p className="error-message">{errors.email}</p>}
              </div>

              <div className="form-group password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="input-field"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {errors.password && <p className="error-message">{errors.password}</p>}
              </div>

              {!isLogin && (
                <div className="form-group password-field">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className="input-field"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  {errors.confirmPassword && (
                    <p className="error-message">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {errors.submit && <p className="error-message">{errors.submit}</p>}

              <button type="submit" className="submit-button">
                {isLogin ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            <div className="switch-mode">
              <button
                className="switch-mode-button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: ''
                  });
                }}
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;