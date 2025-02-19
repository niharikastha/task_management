import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authImage from '../../assets/auth-illustration.webp';
import API_CONFIG from '../../config/api.config';
import { Loader } from 'lucide-react';
import './auth.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [touchedFields, setTouchedFields] = useState({});
  const [passwordVisibility, setPasswordVisibility] = useState({
    main: false,
    confirm: false
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = email => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = pass => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/.test(pass);
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setUserData(current => ({ ...current, [name]: value }));
    setErrorMessage('');
  };

  const handleBlur = e => {
    const { name } = e.target;
    setTouchedFields(current => ({ ...current, [name]: true }));
  };

  const getFieldStatus = fieldName => {
    if (!touchedFields[fieldName]) return '';
    
    const checks = {
      name: () => mode === 'signup' && !userData.name,
      email: () => !userData.email || !validateEmail(userData.email),
      password: () => !userData.password || !validatePassword(userData.password),
      confirmPassword: () => mode === 'signup' && userData.password !== userData.confirmPassword
    };

    return checks[fieldName]?.() ? 'invalid' : '';
  };

  const validateUserInput = () => {
    let newDirtyState = {};
    const validationRules = [
      {
        condition: mode === 'signup' && !userData.name.trim(),
        message: 'Please enter your full name',
        field: 'name'
      },
      {
        condition: !validateEmail(userData.email),
        message: 'Please provide a valid email address',
        field: 'email'
      },
      {
        condition: !validatePassword(userData.password),
        message: 'Password must be at least 6 characters with uppercase, lowercase, number, and special character',
        field: 'password'
      },
      {
        condition: mode === 'signup' && userData.password !== userData.confirmPassword,
        message: 'Password confirmation does not match',
        field: 'confirmPassword'
      }
    ];

    for (const rule of validationRules) {
      if (rule.condition) {
        setErrorMessage(rule.message);
        newDirtyState[rule.field] = true;
        setTouchedFields(newDirtyState);
        return false;
      }
    }

    setErrorMessage('');
    return true;
  };

  const handleFormSubmission = async (e) => {
    e.preventDefault();
    
    const requiredFields = ['email', 'password'];
    if (mode === 'signup') requiredFields.push('name', 'confirmPassword');
    
    setTouchedFields(
      requiredFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    );

    if (!validateUserInput()) return;

    setLoading(true);

    try {
      const endpoint = mode === 'login' ? API_CONFIG.ENDPOINTS.LOGIN : API_CONFIG.ENDPOINTS.SIGNUP;
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      if (result.success) {
        localStorage.setItem(API_CONFIG.TOKEN_KEY, result.data.token);
        navigate('/tasks', { 
          state: { 
            name: userData.name || result.data.name,
            email: userData.email 
          } 
        });
      } else {
        setErrorMessage(result.message || 'Authentication failed');
      }
    } catch (err) {
      setErrorMessage('Connection error. Please try again');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(current => current === 'login' ? 'signup' : 'login');
    setTouchedFields({});
    setErrorMessage('');
    setUserData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-image">
          <img 
            src={authImage}
            alt="auth-task" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        <div className="auth-form">
          <div className="auth-form-container">
            <h2 className="auth-title">
              {mode === 'login' ? 'Hello Again!' : 'Create Account'}
            </h2>
            <p className="auth-subtitle">
              {mode === 'login' ? 'Welcome back you\'ve been missed!' : 'Get started with your account'}
            </p>

            {errorMessage && (
              <div className="validation-summary">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleFormSubmission} className="auth-form-content">
              {mode === 'signup' && (
                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    className={`input-field ${getFieldStatus('name')}`}
                    value={userData.name}
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
                  className={`input-field ${getFieldStatus('email')}`}
                  value={userData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
              </div>

              <div className="form-group password-field">
                <input
                  type={passwordVisibility.main ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className={`input-field ${getFieldStatus('password')}`}
                  value={userData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setPasswordVisibility(prev => ({ ...prev, main: !prev.main }))}
                >
                  {passwordVisibility.main ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {mode === 'signup' && (
                <div className="form-group password-field">
                  <input
                    type={passwordVisibility.confirm ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className={`input-field ${getFieldStatus('confirmPassword')}`}
                    value={userData.confirmPassword}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setPasswordVisibility(prev => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    {passwordVisibility.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              )}

              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? (
                  <>
                    <Loader size={16} className="spinner" />
                    {mode === 'login' ? 'Signing In...' : 'Signing Up...'}
                  </>
                ) : (
                  mode === 'login' ? 'Sign In' : 'Sign Up'
                )}
              </button>

            </form>

            <div className="switch-mode">
              <button className="switch-mode-button" onClick={switchMode}>
                {mode === 'login' 
                  ? "Don't have an account? Sign Up" 
                  : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;