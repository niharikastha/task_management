import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authImage from '../../assets/auth-illustration.webp';
import API_CONFIG from '../../config/api.config';
import './auth.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [touchedFields, setTouchedFields] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationSummary, setValidationSummary] = useState('');

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
    setValidationSummary(''); 
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields(prev => ({ ...prev, [name]: true }));
  };

  const getInputValidationState = (fieldName) => {
    if (!touchedFields[fieldName]) return '';
    
    switch (fieldName) {
      case 'name':
        return !isLogin && !formData.name ? 'invalid' : '';
      case 'email':
        return !formData.email || !validateEmail(formData.email) ? 'invalid' : '';
      case 'password':
        return !formData.password || !validatePassword(formData.password) ? 'invalid' : '';
      case 'confirmPassword':
        return !isLogin && formData.password !== formData.confirmPassword ? 'invalid' : '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    let validationMessage = '';
    
    if (!validateEmail(formData.email)) {
      validationMessage += 'Please enter a valid email address. ';
    }
    
    if (!validatePassword(formData.password)) {
      validationMessage += 'Password must contain at least 6 characters, including uppercase, lowercase, number, and special character. ';
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      validationMessage += 'Passwords do not match. ';
    }

    setValidationSummary(validationMessage.trim());
    return validationMessage === '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const fields = ['email', 'password'];
    if (!isLogin) fields.push('name', 'confirmPassword');
    
    setTouchedFields(
      fields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    );

    if (!validateForm()) return;

    try {
      const endpoint = isLogin ? API_CONFIG.ENDPOINTS.LOGIN : API_CONFIG.ENDPOINTS.SIGNUP;
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem(API_CONFIG.TOKEN_KEY, data.data.token);
        navigate('/tasks', { 
          state: { 
            name: formData.name || data.data.name,
            email: formData.email 
          } 
        });
      } else {
        setValidationSummary(data.message || 'Authentication failed');
      }
    } catch (error) {
      setValidationSummary('An error occurred. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-image">
          <img 
            src={authImage}
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

            {validationSummary && (
              <div className="validation-summary">
                {validationSummary}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form-content">
              {!isLogin && (
                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    className={`input-field ${getInputValidationState('name')}`}
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                  />
                </div>
              )}

              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  className={`input-field ${getInputValidationState('email')}`}
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
              </div>

              <div className="form-group password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className={`input-field ${getInputValidationState('password')}`}
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {!isLogin && (
                <div className="form-group password-field">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className={`input-field ${getInputValidationState('confirmPassword')}`}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              )}

              <button type="submit" className="submit-button">
                {isLogin ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            <div className="switch-mode">
              <button
                className="switch-mode-button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setTouchedFields({});
                  setValidationSummary('');
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