import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const LoginForm = () => {
    const [formData, setFormData] = useState({
      email: '',
      password: '',
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
  
    const validateForm = () => {
      const newErrors = {};
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
  
      if (!formData.password) {
        newErrors.password = 'Password is required';
      }
  
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) return;
  
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
  
        const data = await response.json();
        if (data.success) {
          localStorage.setItem('token', data.data.token);
          // Handle successful login
        } else {
          setErrors({ submit: data.message });
        }
      } catch (error) {
        setErrors({ submit: 'An error occurred. Please try again.' });
      }
    };
  
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
  
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
  
        {errors.submit && (
          <div className="text-sm text-red-600">{errors.submit}</div>
        )}
  
        <button
          type="submit"
          className="w-full py-3 px-4 bg-red-400 hover:bg-red-500 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Sign In
        </button>
      </form>
    );
  };

  export default LoginForm;
