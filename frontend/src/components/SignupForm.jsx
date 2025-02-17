import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const SignupForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
    const validateForm = () => {
      const newErrors = {};
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/;
  
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
  
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
  
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (!passwordRegex.test(formData.password)) {
        newErrors.password = 'Password must be at least 6 characters long and include an uppercase letter, a lowercase letter, a number, and a special character';
      }
  
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
  
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) return;
  
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
  
        const data = await response.json();
        if (data.success) {
          localStorage.setItem('token', data.data.token);
          // Handle successful signup
        } else {
          setErrors({ submit: data.message });
        }
      } catch (error) {
        setErrors({ submit: 'An error occurred. Please try again.' });
      }
    };
  
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form fields similar to LoginForm but with additional name and confirm password fields */}
      </form>
    );
  };

  export default SignupForm;
